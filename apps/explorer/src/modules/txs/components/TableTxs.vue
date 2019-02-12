<template>
  <v-card color="white" flat class="pt-3 pr-2 pl-2 pb-2">
    <!--
    =====================================================================================
      TITLE
    =====================================================================================
    -->
    <v-layout row wrap align-center pb-1>
      <v-flex xs8>
        <v-card-title class="title font-weight-bold">{{ getTitle }}</v-card-title>
      </v-flex>
    </v-layout>
    <v-divider class="lineGrey" />
    <!--
    =====================================================================================
      LOADING / ERROR
    =====================================================================================
    -->
    <v-progress-linear color="blue" indeterminate v-if="loading" class="mt-0" />
    <app-error :has-error="hasError" :message="error" class="mb-4" />
    <!--
    =====================================================================================
      PAGINATION
    =====================================================================================
    -->
    <v-layout v-if="!loading && !hasError" row fill-height align-center justify-space-between>
      <div v-html="paginationText" class="ml-2"></div>
      <v-pagination v-model="page" :length="numPages" class="mt-2 mb-2"> </v-pagination>
    </v-layout>
    <!--
    =====================================================================================
      TABLE HEADER
    =====================================================================================
    -->
    <v-card v-if="!hasError" color="info" flat class="white--text pl-3 pr-1 mt-2 mb-2" height="40px">
      <v-layout align-center justify-start row fill-height pr-3>
        <v-flex xs6 sm8 md5>
          <h5>{{ $t('tableHeader.txN') }}</h5>
        </v-flex>
        <v-flex hidden-xs-only sm3 md2>
          <h5>{{ $t('common.eth') }}</h5>
        </v-flex>
        <v-flex hidden-sm-and-down md2>
          <h5>{{ $t('gas.limit') }}</h5>
        </v-flex>
        <v-flex hidden-sm-and-down md2>
          <h5>{{ $t('common.gwei') }}</h5>
        </v-flex>
        <v-flex hidden-xs-only v-if="!pending" sm1>
          <h5>{{ $t('common.status') }}</h5>
        </v-flex>
        <v-flex v-else hidden-xs-and-up></v-flex>
      </v-layout>
    </v-card>
    <!--
    =====================================================================================
      TABLE BODY
    =====================================================================================
    -->
    <v-card flat v-if="!hasError">
      <v-layout column fill-height class="mb-1">
        <v-flex xs12 v-if="!loading">
          <v-card v-for="tx in transactionsPage" class="transparent" flat :key="tx.getHash()">
            <table-txs-row :tx="tx" :is-pending="pending" />
            <v-divider class="mb-2 mt-2" />
          </v-card>
        </v-flex>
        <v-flex xs12 v-if="loading">
          <div v-for="i in maxItems" :key="i">
            <v-layout grid-list-xs row wrap align-center justify-start fill-height class="pl-2 pr-2 pt-2">
              <v-flex xs6 sm8 md5>
                <v-flex xs12 style="background: #e6e6e6; height: 12px; border-radius: 2px;"></v-flex>
              </v-flex>
              <v-flex hidden-xs-only sm3 md2>
                <v-flex xs12 style="background: #e6e6e6; height: 12px; border-radius: 2px;"></v-flex>
              </v-flex>
              <v-flex hidden-sm-and-down md2>
                <v-flex xs12 style="background: #e6e6e6; height: 12px; border-radius: 2px;"></v-flex>
              </v-flex>
              <v-flex hidden-sm-and-down md2>
                <v-flex xs12 style="background: #e6e6e6; height: 12px; border-radius: 2px;"></v-flex>
              </v-flex>
              <v-flex hidden-xs-only v-if="!pending" sm1>
                <v-flex xs12 style="background: #e6e6e6; height: 12px; border-radius: 2px;"></v-flex>
              </v-flex>
            </v-layout>
            <v-divider class="mb-2 mt-2" />
          </div>
        </v-flex>
      </v-layout>
    </v-card>
  </v-card>
</template>

<script lang="ts">
import AppError from '@app/core/components/ui/AppError.vue'
import TableTxsRow from '@app/modules/txs/components/TableTxsRow.vue'
import { PendingTx, Tx } from '@app/core/models'
import { Vue, Component, Prop } from 'vue-property-decorator'

const MAX_ITEMS = 10

@Component({
  components: {
    AppError,
    TableTxsRow
  }
})
export default class TableTxs extends Vue {
  @Prop({ type: Boolean, default: true }) loading: boolean
  @Prop(String) pageType: string
  @Prop(String) showStyle!: string
  @Prop(Array) transactions!: Tx[] | PendingTx[]
  @Prop(String) error: string

  page = 1 // Current pagination page number

  /*
  ===================================================================================
    Computed Values
  ===================================================================================
  */

  /**
   * Determines whether or not component has an error.
   * If error property is empty string, there is no error.
   *
   * @return {Boolean} - Whether or not error exists
   */
  get hasError(): boolean {
    return this.error !== ''
  }

  /**
   * Return const MAX_ITEMS
   *
   * @return {Integer}
   */
  get maxItems() {
    return MAX_ITEMS
  }

  /**
   * Given a MAX_ITEMS per page, calculate the number of pages for pagination.
   * @return {Integer} - Number of pages of results
   */
  get numPages() {
    return Math.ceil(this.transactions.length / MAX_ITEMS)
  }

  /**
   *  Calculate which portion of the transfers array results to display
   *  based on the current pagination page.
   *  @return {Tx[]} - Array of transfers
   */
  get transactionsPage(): Tx[] | PendingTx[] {
    const startIndex = (this.page - 1) * MAX_ITEMS
    const endIndex = startIndex + MAX_ITEMS
    return this.transactions.slice(startIndex, endIndex)
  }

  /**
   * Correctly generate/format text for pagination display.
   * @return {String} - Pagination text
   */
  get paginationText() {
    const start = this.transactions.length > 0 ? (this.page - 1) * MAX_ITEMS + 1 : 0
    const end = this.transactions.length > 0 ? start + this.transactionsPage.length - 1 : 0
    return `Showing results ${start} - ${end} of ${this.transactions.length}`
  }

  get footnote() {
    return [
      {
        color: 'success',
        text: this.$i18n.t('footnote.success'),
        icon: 'fa-check-circle'
      },
      {
        color: 'warning',
        text: this.$i18n.t('footnote.failed'),
        icon: 'fa fa-times-circle'
      }
    ]
  }

  get getStyle(): string {
    return this.showStyle
  }

  get titles() {
    return {
      tx: this.$i18n.t('title.lastTxs'),
      pending: this.$i18n.t('title.pending'),
      block: this.$i18n.t('title.blockTxs')
    }
  }

  get getTitle(): string {
    return this.titles[this.pageType] || this.titles['tx']
  }

  get pending(): boolean {
    return this.pageType == 'pending'
  }
}
</script>
