<template>
  <app-page-base :has-error="hasError" :error-message="error" :crumbs="crumbs" :is-loading="isLoading">
    <table-tokens :tokens="tokens" />
  </app-page-base>
</template>

<script lang="ts">
import AppPageBase from '@app/core/components/ui/AppPageBase.vue'
import TableTokens from '@app/modules/tokens/components/TableTokens.vue'
import { Component, Vue } from 'vue-property-decorator'

@Component({
  components: {
    AppPageBase,
    TableTokens
  }
})
export default class PageTokens extends Vue {
  tokens: any = [] // Array of tokens for table display
  hasError = false // Boolean flag to determine whether or not there is an error to display
  error = '' // Error message

  /*
  ===================================================================================
    Mounted
  ===================================================================================
  */

  mounted() {
    this.fetchData()
  }

  /*
  ===================================================================================
    Methods
  ===================================================================================
  */

  /**
   * Fetch all data relevant to the view.
   */
  fetchData() {
    const tokenPromise = this.fetchTokens()
    const promises = [tokenPromise]

    Promise.all(promises)
      .then(([tokens]) => {
        this.tokens = tokens as any[]
      })
      .catch(e => {
        this.hasError = true
        this.error = e
      })
  }

  /**
   * GET and return a JSON array of ETH-based tokens
   *
   * @return {Array} - Array of ETH Tokens.
   */
  fetchTokens() {
    return new Promise((resolve, reject) => {
      this.$http
        .get('http://api.ethplorer.io/getTop?apiKey=freekey&criteria=cap')
        .then(response => {
          if (response.data.error) {
            return reject(response.data.error.message)
          }
          resolve(response.data.tokens)
        })
        .catch(err => {
          reject(err.data.error.message)
        })
    })
  }

  /**
   * GET and return JSON array of tokens and their corresponding information
   *
   * @return {Array} - Array of tokens
   */
  fetchTokenExchangeRates() {
    return new Promise((resolve, reject) => {
      this.$api
        .getTokenExchangeRates(99999, 0)
        .then(result => {
          resolve(result)
        })
        .catch(e => {
          reject(e)
        })
    })
  }

  /*
  ===================================================================================
    Computed Values
  ===================================================================================
  */

  /**
   * Returns breadcrumbs entry for this particular view.
   * Required for AppBreadCrumbs
   *
   * @return {Array} - Breadcrumb entry. See description.
   */
  get crumbs() {
    return [
      {
        text: this.$i18n.t('title.tokens'),
        disabled: true
      }
    ]
  }

  /**
   * Determines whether or not all of the required objects have been loaded/populated
   *
   * @return {Boolean}
   */
  get isLoading() {
    return this.tokens.length === 0
  }
}
</script>
