<template>
  <app-tabs :tabs="tabs">
    <!--
    =====================================================================================
      TRANSFERS
    =====================================================================================
    -->
    <v-tab-item slot="tabs-item" value="tab-0">
      <v-progress-linear color="blue" indeterminate v-if="isTransfersLoading" class="mt-0" />
      <transfer-table-tokens :transfers="transfers" v-if="!isTransfersLoading" />
    </v-tab-item>
    <!--
    =====================================================================================
      HOLDERS
    =====================================================================================
    -->
    <v-tab-item slot="tabs-item" value="tab-1">
      <v-progress-linear color="blue" indeterminate v-if="isHoldersLoading" class="mt-0" />
      <holder-table-tokens :holders="holders" :address-ref="addressRef" v-if="!isHoldersLoading" />
    </v-tab-item>
  </app-tabs>
</template>

<script lang="ts">
import AppTabs from '@app/core/components/ui/AppTabs.vue'
import TransferTableTokens from '@app/modules/tokens/components/TransferTableTokens.vue'
import HolderTableTokens from '@app/modules/tokens/components/HolderTableTokens.vue'
import { Tx } from '@app/core/models'
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({
  components: {
    AppTabs,
    TransferTableTokens,
    HolderTableTokens
  }
})
export default class TransferListTokens extends Vue {
  @Prop(String) addressRef: string

  isTransfersLoading = true
  activeTab = 0
  transfers: any = []
  holders: any = []

  /*
  ===================================================================================
    Lifecycle
  ===================================================================================
  */

  async mounted() {
    try {
      this.transfers = await this.fetchTokenTransfers()
    } catch (e) {
      // Handle error
    }

    try {
      this.holders = await this.fetchTopTokenHolders()
    } catch (e) {
      // Handle error
    }
  }

  /*
  ===================================================================================
    Methods
  ===================================================================================
  */

  /**
   * Fetch latest [10] token transfers for a particular token contract
   *
   * @return {Array} - Array of token transfers/info
   */
  fetchTokenTransfers() {
    return new Promise((resolve, reject) => {
      this.isTransfersLoading = true
      this.$http
        .get(`http://api.ethplorer.io/getTokenHistory/${this.addressRef}?apiKey=freekey&type=transfer&limit=10`)
        .then(response => {
          if (response.data.error) {
            return reject(response.data.error.message)
          }
          this.isTransfersLoading = false
          resolve(response.data.operations)
        })
        .catch(err => {
          this.isTransfersLoading = false
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

  /*
  ===================================================================================
    Computed Values
  ===================================================================================
  */

  /**
   * Determines whether or not the holders object has been loaded/populated
   *
   * @return {Boolean}
   */
  get isHoldersLoading(): boolean {
    return this.holders.length === 0
  }

  /**
   * Props object to describe tabs for AppTabs component
   */
  get tabs() {
    const tabs = [
      {
        id: '0',
        title: 'Transfers',
        isActive: true
      },
      {
        id: '1',
        title: 'Holders',
        isActive: false
      }
    ]
    return tabs
  }
}
</script>
