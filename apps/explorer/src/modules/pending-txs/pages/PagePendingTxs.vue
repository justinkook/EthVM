<template>
  <v-container grid-list-lg class="mt-0">
    <app-bread-crumbs :new-items="crumbs" />
    <v-layout row justify-center mb-4>
      <v-flex xs12> <table-pending-txs :transactions="pendingTxs" page-type="tx" :loading="isLoading" :error="error"/></v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import AppBreadCrumbs from '@app/core/components/ui/AppBreadCrumbs.vue'
import TablePendingTxs from '@app/modules/pending-txs/components/TablePendingTxs.vue'
import { Vue, Component } from 'vue-property-decorator'
import { Tx, PendingTx } from '@app/core/models'
import { Events } from 'ethvm-common'

const MAX_ITEMS = 50

@Component({
  components: {
    AppBreadCrumbs,
    TablePendingTxs
  }
})
export default class PagePendingTxs extends Vue {
  page = 0 // Current pagination page
  isLoading = true // Whether all data for view has finished loading. Can be empty array, so much set manually
  error = '' // Error string (will be empty string if no error)

  /*
  ===================================================================================
    Lifecycle
  ===================================================================================
  */

  async mounted() {
    await this.loadData()
  }

  /*
  ===================================================================================
    Methods
  ===================================================================================
  */

  /**
   * Load/fetch all data required to display the view
   */
  loadData() {
    const pendingTxsPromise = this.fetchPendingTxs()
    const promises = [pendingTxsPromise]

    Promise.all(promises)
      .then(([pendingTxs]) => {
        this.commitPendingTx(pendingTxs)
        this.isLoading = false
      })
      .catch(e => {
        this.error = `${e}`
        this.isLoading = false
      })
  }

  /**
   * After fetching PendingTx[] from API, commit to vuex
   * and emit event.
   *
   * @param  {PendingTx[]} pendingTx - Array of PendingTx[] obtained from API
   */
  commitPendingTx(pendingTx) {
    this.$store.commit(Events.NEW_PENDING_TX, pendingTx)
    if (pendingTx && pendingTx.length > 0) {
      this.$eventHub.$emit(Events.NEW_PENDING_TX)
    }
  }

  /**
   * Use API to fetch current page of transactions
   *
   * @return {PendingTx[]} - Array of pending transactions
   */
  fetchPendingTxs(): Promise<PendingTx[]> {
    return new Promise((resolve, reject) => {
      this.$api
        .getPendingTxs(MAX_ITEMS, this.page)
        .then(response => {
          if (response === null) {
            reject(response)
          }
          resolve(response)
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  /*
  ===================================================================================
    Computed Values
  ===================================================================================
  */

  /**
   * PendingTx[] commited to vuex
   */
  get pendingTxs(): PendingTx[] {
    return this.$store.getters.pendingTxs
  }

  /**
   * Returns breadcrumbs entry for this particular view.
   * Required for AppBreadCrumbs
   *
   * @return {Array} - Breadcrumb entry. See description.
   */
  get crumbs() {
    return [
      {
        text: this.$i18n.t('title.pending'),
        disabled: true
      }
    ]
  }
}
</script>
