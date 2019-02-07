<template>
  <v-card color="white" flat>
    <!--
    =====================================================================================
      ERROR
    =====================================================================================
    -->
    <!-- <app-error :has-error="hasError" :message="error" /> -->
    <!--
    =====================================================================================
      TITLE
    =====================================================================================
    -->
    <div v-if="isLoading">
      <v-card-title class="title font-weight-bold pl-4">
        <div style="width: 300px; height: 20px; background: #e6e6e6; border-radius: 2px;"></div>
      </v-card-title>
    </div>
    <div v-else>
      <v-card-title class="title font-weight-bold pl-4">{{ token.name }} ({{ token.symbol }})</v-card-title>
      <v-divider class="lineGrey" />
    </div>
    <!--
    =====================================================================================
      LOADING
    =====================================================================================
    -->
    <v-progress-linear color="blue" indeterminate v-if="isLoading" />
    <!--
    =====================================================================================
      DETAILS
    =====================================================================================
    -->
    <v-list-tile v-for="(item, index) in details" :key="index">
      <v-layout align-center justify-start row fill-height class="pa-3">
        <!-- Detail Title -->
        <v-flex xs4 sm3 md2>
          <div class="info--text font-weight-medium" v-html="item.title" />
        </v-flex>
        <!-- Detail Info -->
        <v-flex xs7 sm8 md9>
          <div v-if="isLoading">
            <v-flex xs12 style="background: #e6e6e6; height: 12px; border-radius: 2px;"></v-flex>
          </div>
          <div v-else>
            <div v-if="!item.link" class="text-muted text-truncate" v-html="item.detail"></div>
            <router-link v-else :to="item.link">
              <div class="text-truncate" v-html="item.detail"></div>
            </router-link>
          </div>
        </v-flex>
      </v-layout>
    </v-list-tile>
  </v-card>
</template>

<script lang="ts">
import { Detail } from '@app/core/components/props'
import { Component, Vue, Prop } from 'vue-property-decorator'
import AppError from '@app/core/components/ui/AppError.vue'

@Component({
  components: {
    AppError
  }
})
export default class DetailsListTokens extends Vue {
  @Prop(String) addressRef: string // Token contract address

  contract: any = {} // Contract details object
  token: any = {} // Token details object
  hasError = false
  error = ''

  /*
  ===================================================================================
    Lifecycle
  ===================================================================================
  */

  async mounted() {
    try {
      this.contract = await this.fetchContractDetails()
      this.token = await this.fetchTokenDetails()
    } catch (e) {
      // Handle error
      this.hasError = true
      this.error = `${e}`
    }
  }

  /*
  ===================================================================================
    Methods
  ===================================================================================
  */

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

  /*
  ===================================================================================
    Computed Values
  ===================================================================================
  */

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
   * Determines whether or not all of the required objects have been loaded/populated
   *
   * @return {Boolean}
   */
  get isLoading(): boolean {
    return this.isContractLoading || this.isTokenLoading
  }

  /**
   * Properly format the Details[] array for the details table.
   * If the data hasn't been loaded yet, then only include the titles in the details.
   */
  get details(): Detail[] {
    const icons = {
      blog: 'fab fa-ethereum',
      chat: 'fab fa-ethereum',
      facebook: 'fab fa-facebook',
      forum: 'fas fa-comments',
      github: 'fab fa-github',
      gitter: 'fab fa-gitter',
      instagram: 'fab fa-instagram',
      linkedin: 'fab fa-linkedin',
      reddit: 'fab fa-reddit',
      slack: 'fab fa-slack',
      telegram: 'fab fa-telegram',
      twitter: 'fab fa-twitter',
      youtube: 'fab fa-youtube'
    }
    let details
    if (this.isLoading) {
      details = [
        {
          title: this.$i18n.t('title.contract').toString()
        },
        {
          title: this.$i18n.t('token.owner').toString()
        },
        {
          title: this.$i18n.t('title.supply').toString()
        },
        {
          title: this.$i18n.t('title.price').toString()
        },
        {
          title: this.$i18n.t('title.marketCap').toString()
        },
        {
          title: this.$i18n.t('token.totalHold').toString()
        },
        {
          title: this.$i18n.t('title.decimals').toString()
        },
        {
          title: this.$i18n.t('title.website').toString()
        },
        {
          title: this.$i18n.t('title.support').toString()
        },
        {
          title: this.$i18n.t('title.links').toString()
        }
      ]
    } else {
      details = [
        {
          title: this.$i18n.t('title.contract').toString(),
          detail: this.token.address,
          link: this.token ? `/address/${this.token.address}` : ''
        },
        {
          title: this.$i18n.t('token.owner').toString(),
          detail: this.token.owner,
          link: `/address/${this.token.owner}`
        },
        {
          title: this.$i18n.t('title.supply').toString(),
          detail: this.token.totalSupply
        },
        {
          title: this.$i18n.t('title.price').toString(),
          detail: `$${this.token.price.rate} (${this.token.price.diff}%)`
        },
        {
          title: this.$i18n.t('title.marketCap').toString(),
          detail: `$${this.token.price.marketCapUsd}`
        },
        {
          title: this.$i18n.t('token.totalHold').toString(),
          detail: `${this.token.holdersCount}`
        },
        {
          title: this.$i18n.t('title.decimals').toString(),
          detail: this.contract.metadata.decimals
        },
        {
          title: this.$i18n.t('title.website').toString(),
          detail: `<a href="${this.contract.metadata.website}" target="_BLANK">${this.contract.metadata.website}</a>`
        },
        {
          title: this.$i18n.t('title.support').toString(),
          detail: `<a href="mailto:${this.contract.metadata.support.email}" target="_BLANK">${this.contract.metadata.support.email}</a>`
        },
        {
          title: this.$i18n.t('title.links').toString(),
          detail: Object.entries(this.contract.metadata.social)
            .map(obj => {
              const name = obj[0]
              const url = obj[1]
              if (url === null || url === '') {
                return ''
              }
              return `<a href="${url}" target="_BLANK"><i aria-hidden="true" class="v-icon secondary--text ${
                icons[name]
              } pr-2 material-icons theme--light"></i></a>`
            })
            .reduce((a, b) => {
              return `${a}${b}`
            })
        }
      ]
    }
    return details
  }
}
</script>
