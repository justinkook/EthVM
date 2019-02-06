<template>
  <v-container grid-list-lg>
    <!--
    =====================================================================================
      ERROR
    =====================================================================================
    -->
    <div v-if="hasError">
      <app-error :message="error" />
    </div>
    <!--
    =====================================================================================
      HOLDER DETAILS
    =====================================================================================
    -->
    <div v-if="isHolder && !hasError">
      <app-loading :isLoading="isLoading || isHolderDetailsLoading" >
        <app-bread-crumbs :new-items="crumbs" />
        <details-list-tokens-holder :contract="contract" :token="token" :holder="holderInfo" class="mb-5" />
        <details-tabs-tokens-holder v-if="holderTransactions.length > 0" :transfers="holderTransactions" :address-ref="addressRef" />
      </app-loading>
    </div>
    <!--
    =====================================================================================
      BASIC DETAILS
    =====================================================================================
    -->
    <div v-if="!isHolder && !hasError">
      <app-loading :isLoading="isLoading" >
        <app-bread-crumbs :new-items="crumbs" />
        <details-list-tokens :contract="contract" :token="token" class="mb-5" />
        <details-tabs-tokens :transfers="temporaryTokenTransfers" :holders="tokenHolders" :address-ref="addressRef" />
      </app-loading>
    </div>
  </v-container>
</template>

<script lang="ts">
import AppError from '@app/core/components/ui/AppError.vue'
import AppLoading from '@app/core/components/ui/AppLoading.vue'
import AppBreadCrumbs from '@app/core/components/ui/AppBreadCrumbs.vue'
import AppSocialLink from '@app/core/components/ui/AppSocialLink.vue'
import DetailsListTokens from '@app/modules/tokens/components/DetailsListTokens.vue'
import DetailsListTokensHolder from '@app/modules/tokens/components/DetailsListTokensHolder.vue'
import DetailsTabsTokens from '@app/modules/tokens/components/DetailsTabsTokens.vue'
import DetailsTabsTokensHolder from '@app/modules/tokens/components/DetailsTabsTokensHolder.vue'
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Events } from 'ethvm-common'
import { Detail } from '@app/core/components/props'
import { Token, Tx } from '@app/core/models'

const MAX_ITEMS = 10

@Component({
  components: {
    AppError,
    AppLoading,
    AppBreadCrumbs,
    DetailsListTokens,
    DetailsListTokensHolder,
    DetailsTabsTokens,
    DetailsTabsTokensHolder
  }
})
export default class PageDetailsToken extends Vue {
  @Prop({ type: String }) addressRef!: string

  address = '' // TEMP: Formatted address with "0x" removed from beginning
  contract: any = {} // Contract details object
  token: any = {} // Token details object
  tokenTransfers: any[] = [] // Array of token transfers
  tokenHolders: any[] = [] // Array of token holders
  isHolder = false // Whether or not "holder" is included in query params to display view accordingly
  holderAddress: any = '' // Address of current token holder, if applicable
  holderTransactions: any[] = [] // Transactions for a particular holder address
  holderTransactionsLoading = true // Boolean flag to detect if holder transactions have been loaded
  holderInfo: any = {} // Balance/information for a particular holder address
  hasError = false // Boolean whether or not page has errors to display
  error = '' // Error message

  /*
  ===================================================================================
    Lifecycle
  ===================================================================================
  */

  mounted() {
    this.fetchData()
  }

  @Watch('$route', { deep: true })
  onRouteChange() {
    const query = this.$route.query
    if (query.holder) {
      this.fetchHolderData()
    } else {
      this.isHolder = false
      this.holderTransactions = []
      this.holderTransactionsLoading = false
      this.holderInfo = {}
    }
  }

  /*
  ===================================================================================
    Methods
  ===================================================================================
  */

  /**
   * Fetch all data relevant to the view. Data will be different if "holder"
   * is included in the query parameters..
   */
  async fetchData() {
    const query = this.$route.query
    this.isHolder = false
    this.holderTransactionsLoading = false

    this.fetchNormalData()

    if (query.holder) {
      this.fetchHolderData()
    }
  }

  /**
   * Fetch all data required for a "basic" load
   */
  fetchNormalData() {
    return new Promise((resolve, reject) => {
      const contractPromise = this.fetchContractDetails()
      const tokenPromise = this.fetchTokenDetails()
      const tokenTransfersPromise = this.fetchAddressTokensTransfers()
      const tokenHoldersPromise = this.fetchTopTokenHolders()

      const promises = [contractPromise, tokenPromise, tokenTransfersPromise, tokenHoldersPromise]

      Promise.all(promises)
        .then(([contract, token, tokenTransfers, tokenHolders]) => {
          this.contract = contract
          this.token = token
          this.tokenTransfers = tokenTransfers as any[]
          this.tokenHolders = tokenHolders as any[]
          resolve()
        })
        .catch(e => {
          // Handle error accordingly
          this.hasError = true
          this.error = e
        })
    })
  }

  /**
   * Fetch all data required for a "holder" view
   */
  fetchHolderData() {
    return new Promise((resolve, reject) => {
      const query = this.$route.query
      this.isHolder = true
      this.holderAddress = query.holder

      const holderTransactionsPromise = this.fetchHolderTransactions()
      const holderInfoPromise = this.fetchHolderInfo()

      const promises = [holderTransactionsPromise, holderInfoPromise]

      Promise.all(promises)
        .then(([holderTransactions, holderInfo]) => {
          this.holderTransactions = holderTransactions as any[]
          this.holderInfo = holderInfo
          this.holderTransactionsLoading = false
          resolve()
        })
        .catch(e => {
          // Handle error accordingly
          this.hasError = true
          this.error = e
        })
    })
  }

  /**
   * Retrieve contract details for a the given token contract address.
   *
   * @return {Object} - Contract details and metadata
   */
  fetchContractDetails() {
    return new Promise((resolve, reject) => {
      this.$api
        .getContract(this.addressRef)
        .then(result => {
          resolve(result)
        })
        .catch(e => {
          reject(e)
        })
    })
  }

  /**
   * Retrieve array of token transfers for a given token contract address.
   *
   * @return {Array} - Array of token transfers
   */
  fetchAddressTokensTransfers(page = 0, limit = MAX_ITEMS) {
    return new Promise((resolve, reject) => {
      this.$api
        .getAddressTokenTransfers(this.addressRef, limit, page)
        .then(result => {
          resolve(result)
        })
        .catch(e => {
          reject(e)
        })
    })
  }

  /**
   * GET and return a JSON details object for a particular token address
   *
   * @return {Array} - Token details
   */
  fetchTokenDetails() {
    return new Promise((resolve, reject) => {
      this.$http
        .get(`http://api.ethplorer.io/getTokenInfo/${this.addressRef}?apiKey=freekey&additional=image`)
        .then(response => {
          if (response.data.error) {
            return reject(response.data.error.message)
          }
          resolve(response.data)
        })
        .catch(err => {
          reject(err.data.error.message || err)
        })
    })
  }

  /**
   * GET and return a JSON array of top holders for a particular token address
   *
   * @return {Array} - Array of holders
   */
  fetchTopTokenHolders() {
    return new Promise((resolve, reject) => {
      this.$http
        .get(`http://api.ethplorer.io/getTopTokenHolders/${this.addressRef}?apiKey=freekey`)
        .then(response => {
          if (response.data.error) {
            return reject(response.data.error.message)
          }
          resolve(response.data.holders)
        })
        .catch(err => {
          reject(err.data.error.message || err)
        })
    })
  }

  /**
   * GET and return JSON object of balances and information for a particular address/token
   *
   * @return {Object} - Information object
   */
  fetchHolderInfo() {
    return new Promise((resolve, reject) => {
      this.$http
        .get(`http://api.ethplorer.io/getAddressInfo/${this.holderAddress}?apiKey=freekey&token=${this.addressRef}`)
        .then(response => {
          if (response.data.error) {
            return reject(response.data.error.message)
          }
          resolve(response.data)
        })
        .catch(err => {
          reject(err.data.error.message || err)
        })
    })
  }

  /**
   * GET and return JSON array of transactions for a particular holder address
   *
   * @return {Array} - Array of transactions
   */
  fetchHolderTransactions() {
    return new Promise((resolve, reject) => {
      this.$http
        .get(`http://api.ethplorer.io/getAddressHistory/${this.holderAddress}?apiKey=freekey&token=${this.addressRef}&type=transfer`)
        .then(response => {
          if (response.data.error) {
            return reject(response.data.error.message)
          }
          resolve(response.data.operations)
        })
        .catch(err => {
          reject(err.data.error.message || err)
        })
    })
  }

  /*
  ===================================================================================
    Computed Values
  ===================================================================================
  */

  /**
   * Use txs in Vuex until api returns valid data.
   *
   * @return {Tx[]} - Array of recent transactions
   */
  get temporaryTokenTransfers(): Tx[] {
    return this.$store.getters.txs
  }

  /**
   * Returns breadcrumbs entry for this particular view.
   * Required for AppBreadCrumbs
   *
   * @return {Array} - Breadcrumb entry. See description.
   */
  get crumbs() {
    let crumbs
    if (this.isHolder) {
      crumbs = [
        {
          text: this.$i18n.t('title.tokens'),
          link: '/tokens',
          disabled: false
        },
        {
          text: this.token.symbol,
          link: `/token/${this.addressRef}`,
          disabled: false
        },
        {
          text: this.holderAddress,
          link: '',
          disabled: true
        }
      ]
    } else {
      crumbs = [
        {
          text: this.$i18n.t('title.tokens'),
          link: '/tokens',
          disabled: false
        },
        {
          text: this.token.symbol,
          link: `/token/${this.addressRef}`,
          disabled: true
        }
      ]
    }
    return crumbs
  }

  /**
   * Determines whether or not the contract object has been loaded/populated
   *
   * @return {Boolean}
   */
  get isContractLoading(): boolean {
    return Object.keys(this.contract).length === 0
  }

  /**
   * Determines whether or not the token object has been loaded/populated
   *
   * @return {Boolean}
   */
  get isTokenLoading(): boolean {
    return Object.keys(this.token).length === 0
  }

  /**
   * Determines whether or not the transfers object has been loaded/populated
   *
   * @return {Boolean}
   */
  get isTransfersLoading(): boolean {
    return this.temporaryTokenTransfers.length === 0
  }

  /**
   * Determines whether or not the holders object has been loaded/populated
   *
   * @return {Boolean}
   */
  get isHoldersLoading(): boolean {
    return this.tokenHolders.length === 0
  }

  /**
   * Determines whether or not the holders transactions object has been loaded/populated
   *
   * @return {Boolean}
   */
  get isHolderTransactionsLoading(): boolean {
    return this.holderTransactionsLoading // this.holderTransactions.length === 0
  }

  /**
   * Determines whether or not the holder info object has been loaded/populated
   *
   * @return {Boolean}
   */
  get isHolderInfoLoading(): boolean {
    return Object.keys(this.holderInfo).length === 0
  }

  /**
   * Determines whether or not all of the required objects have been loaded/populated
   *
   * @return {Boolean}
   */
  get isLoading(): boolean {
    return this.isContractLoading || this.isTokenLoading || this.isTransfersLoading || this.isHoldersLoading
  }

  /**
   * Determines whether or not all of the required/additional holder objects have been loaded/populated
   *
   * @return {Boolean}
   */
  get isHolderDetailsLoading(): boolean {
    return this.isHolderTransactionsLoading || this.isHolderInfoLoading
  }

  /*
  ===================================================================================
    Old
  ===================================================================================
  */

  // // Methods:
  // setDetails(token: Token) {
  //   this.details = [
  //     {
  //       title: this.$i18n.t('token.symbol'),
  //       detail: token.getSymbol()
  //     },
  //     // {
  //     //   title: this.$i18n.t('addrOverview.creator'),
  //     //   detail: token.getContract(),
  //     //   link: '/contract/' + token.getContract()
  //     // },
  //     {
  //       title: this.$i18n.t('token.price'),
  //       detail: token.getPrice(),
  //       copy: true
  //     },
  //     // {
  //     //   title: this.$i18n.t('token.transfers'),
  //     //   detail: token.getTransfers()
  //     // },
  //     {
  //       title: this.$i18n.t('token.decimals'),
  //       detail: token.getDecimals()
  //     }
  //   ]
  //   if (this.holder !== '') {
  //     const holderInfo = [
  //       // {
  //       //   title: this.$i18n.t('token.totalUSD'),
  //       //   details: token.getBalance() * token.getPrice()
  //       // },
  //       // {
  //       //   title: this.$i18n.t('token.balance'),
  //       //   detail: token.getBalance()
  //       // },
  //       {
  //         title: this.$i18n.t('token.holder'),
  //         detail: token.getHolder(),
  //         link: '/address/' + token.getHolder()
  //       }
  //     ]
  //     holderInfo.forEach(i => this.details.unshift(i))
  //   } else {
  //     const tokenInfo = [
  //       {
  //         title: this.$i18n.t('token.totalHold'),
  //         detail: token.getTotalHolders()
  //       },
  //       {
  //         title: this.$i18n.t('token.supply'),
  //         detail: token.getTotalSupply()
  //       }
  //     ]
  //     tokenInfo.forEach(i => this.details.push(i))
  //   }
  // }
}
</script>
