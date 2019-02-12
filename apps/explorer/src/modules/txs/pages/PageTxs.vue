<template>
  <v-container grid-list-lg class="mt-0">
    <app-bread-crumbs :new-items="crumbs" />
    <app-card-stats-group type="txs" />
    <v-layout row justify-center mb-4>
      <v-flex xs12> <table-txs :transactions="txs" page-type="tx" :loading="isLoading" :error="error"/></v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import AppBreadCrumbs from '@app/core/components/ui/AppBreadCrumbs.vue'
import AppCardStatsGroup from '@app/core/components/ui/AppCardStatsGroup.vue'
import TableTxs from '@app/modules/txs/components/TableTxs.vue'
import { Vue, Component, Mixins } from 'vue-property-decorator'
import { Tx } from '@app/core/models'

const MAX_ITEMS = 50

@Component({
  components: {
    AppBreadCrumbs,
    AppCardStatsGroup,
    TableTxs
  }
})
export default class PageTxs extends Vue {
  txs: Tx[] = []
  page = 0
  isLoading = true
  error = ''

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

  loadData() {
    const txsPromise = this.fetchTxs()
    const promises = [txsPromise]

    Promise.all(promises)
      .then(([txs]) => {
        this.txs = txs as Tx[]
        this.isLoading = false
      })
      .catch(e => {
        this.error = `${e}`
        this.isLoading = false
      })
  }

  fetchTxs(): Promise<Tx[]> {
    return new Promise((resolve, reject) => {
      this.$api
        .getTxs(MAX_ITEMS, this.page)
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

  // Computed
  get crumbs() {
    return [
      {
        text: this.$i18n.t('title.mined'),
        disabled: true
      }
    ]
  }
}
</script>
