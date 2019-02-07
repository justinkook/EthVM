<template>
  <v-container grid-list-lg>
    <app-bread-crumbs :new-items="crumbs" />
    <token-details-list
      :address-ref="addressRef"
      :contract-details="contractDetails"
      :token-details="tokenDetails"
      :is-loading="isContractDetailsLoading || isTokenDetailsLoading"
      :error="errorTokenDetailsList"
    />
    <!-- <details-tabs-tokens :address-ref="addressRef" /> -->
  </v-container>
</template>

<script lang="ts">
import AppBreadCrumbs from '@app/core/components/ui/AppBreadCrumbs.vue'
import TokenDetailsList from '@app/modules/tokens/components/TokenDetailsList.vue'
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Events } from 'ethvm-common'
import { Detail } from '@app/core/components/props'
import { Token, Tx } from '@app/core/models'

const MAX_ITEMS = 10

@Component({
  components: {
    AppBreadCrumbs,
    TokenDetailsList
  }
})
export default class PageDetailsToken extends Vue {
  @Prop({ type: String }) addressRef!: string

  address = '' // TEMP: Formatted address with "0x" removed from beginning

  // Basic //
  contractDetails: any = {} // Contract details object
  tokenDetails: any = {} // Token details object
  tokenTransfers: any[] = [] // Array of token transfers
  tokenHolders: any[] = [] // Array of token holders
  errorTokenDetailsList = ''
  errorTokenTransfersTab = ''
  errorTokenHoldersTab = ''

  // Holder //
  isHolder = false // Whether or not "holder" is included in query params to display view accordingly
  holderAddress: any = '' // Address of current token holder, if applicable
  holderDetails: any = {} // Balance/information for a particular holder address
  holderTransactions: any[] = [] // Transactions for a particular holder address
  holderTransactionsLoading = true // Boolean flag to detect if holder transactions have been loaded

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
  fetchData() {
    this.fetchNormalData()
  }

  /**
   * Fetch all data required for a "basic" load
   */
  async fetchNormalData() {
    // TokenDetailsList //
    const contractDetailsPromise = this.fetchContractDetails()
    const tokenDetailsPromise = this.fetchTokenDetails()
    const tokenDetailsListPromises = [contractDetailsPromise, tokenDetailsPromise]

    Promise.all(tokenDetailsListPromises)
      .then(([contractDetails, tokenDetails]) => {
        this.contractDetails = contractDetails
        this.tokenDetails = tokenDetails
      })
      .catch(e => {
        this.errorTokenDetailsList = `${e}`
      })
    // try {
    //   this.contractDetails = await this.fetchContractDetails()
    //   this.tokenDetails = await this.fetchTokenDetails()
    // } catch (e) {
    //   this.errorTokenDetailsList = `err`
    //   console.log(this.errorTokenDetailsList)
    // }

    // const tokenTransfersPromise = this.fetchTokensTransfers()
    // const tokenHoldersPromise = this.fetchTopTokenHolders()
  }

  /**
   * Fetch all data required for a "holder" view
   */
  fetchHolderData() {
    return new Promise((resolve, reject) => {
      // const query = this.$route.query
      // this.isHolder = true
      // this.holderAddress = query.holder
      // const holderTransactionsPromise = this.fetchHolderTransactions()
      // const holderInfoPromise = this.fetchHolderInfo()
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
   * Retrieve array of token transfers for a given token contract address.
   *
   * @return {Array} - Array of token transfers
   */
  fetchTokensTransfers(page = 0, limit = MAX_ITEMS) {
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
  fetchHolderDetails() {
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
    Computed Values - Crumbs
  ===================================================================================
  */

  /**
   * Returns breadcrumbs entry for this particular view.
   * Required for AppBreadCrumbs
   *
   * @return {Array} - Breadcrumb entry. See description.
   */
  get crumbs() {
    return this.isHolder ? this.crumbsHolder : this.crumbsBasic
  }

  /**
   * Returns breadcrumbs for "holder" view
   *
   * @return {Array} - Breadcrumb entry. See description.
   */
  get crumbsBasic() {
    return [
      {
        text: this.$i18n.t('title.tokens'),
        link: '/tokens',
        disabled: false
      },
      {
        text: this.addressRef, // this.token.symbol,
        link: `/token/${this.addressRef}`,
        disabled: true
      }
    ]
  }

  /**
   * Returns breadcrumbs for "basic" view
   *
   * @return {Array} - Breadcrumb entry. See description.
   */
  get crumbsHolder() {
    return [
      {
        text: this.$i18n.t('title.tokens').toString(),
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
  }

  /*
  ===================================================================================
    Computed Values - isLoading
  ===================================================================================
  */

  /**
   * Determines whether or not the contractDetails object has been loaded/populated
   *
   * @return {Boolean}
   */
  get isContractDetailsLoading(): boolean {
    return Object.keys(this.contractDetails).length === 0
  }

  /**
   * Determines whether or not the tokenDetails object has been loaded/populated
   *
   * @return {Boolean}
   */
  get isTokenDetailsLoading(): boolean {
    return Object.keys(this.tokenDetails).length === 0
  }

  /**
   * Determines whether or not the tokenTransfers object has been loaded/populated
   *
   * @return {Boolean}
   */
  get isTokenTransfersLoading(): boolean {
    return this.tokenTransfers.length === 0
  }

  /**
   * Determines whether or not the tokenHolders object has been loaded/populated
   *
   * @return {Boolean}
   */
  get isTokenHoldersLoading(): boolean {
    return this.tokenHolders.length === 0
  }

  /**
   * Determines whether or not the holderDetails object has been loaded/populated
   *
   * @return {Boolean}
   */
  get isHolderDetailsLoading(): boolean {
    return Object.keys(this.holderDetails).length === 0
  }

  /**
   * Determines whether or not the holdersTransactions object has been loaded/populated
   *
   * @return {Boolean}
   */
  get isHolderTransactionsLoading(): boolean {
    return this.holderTransactionsLoading // this.holderTransactions.length === 0
  }

  /**
   * Determines whether or not all of the required objects for a "basic" (not holder) view have been loaded/populated
   *
   * @return {Boolean}
   */
  get isBasicLoading(): boolean {
    return this.isContractDetailsLoading || this.isTokenDetailsLoading || this.isTokenTransfersLoading
  }

  /**
   * Determines whether or not all of required objects for a "holder" view have been loaded/populated
   *
   * @return {Boolean}
   */
  get isHolderLoading(): boolean {
    return this.isHolder ? this.isHolderDetailsLoading || this.isBasicDetailsLoading : this.isBasicDetailsLoading
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
