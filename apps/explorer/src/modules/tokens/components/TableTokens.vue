<template>
  <v-layout row wrap justify-center mb-4>
    {{ isLoading }}
    <v-flex xs12>
      <v-data-table :headers="headers" :items="filteredTokens" :must-sort="true" :pagination.sync="sortBy" :custom-sort="customSort" class="elevation-1">
        <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
        <template slot="items" slot-scope="props" v-if="hasCompleteData(props.item)">
          <td>
            <v-layout align-center justify-start row fill-height>
              <img :src="props.item.image" class="mr-2" style="width: 25px" />
              <router-link :to="tokenLink(props.item.address)">{{ props.item.name }}</router-link>
            </v-layout>
          </td>
          <td class="">{{ props.item.current_price }}</td>
          <td class="">{{ props.item.price_change_percentage_24h }}</td>
          <td class="">{{ props.item.total_volume }}</td>
          <td class="text-xs-right">{{ props.item.market_cap }}</td>
        </template>
      </v-data-table>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class TableTokens extends Vue {
  @Prop(Array) tokens!: Array<Object>
  @Prop(Boolean) isLoading: boolean

  // See https://vuetifyjs.com/en/components/data-tables (pagination.sync) //
  sortBy = {
    descending: true,
    rowsPerPage: 10,
    sortBy: 'marketCap'
  }

  /*
  ===================================================================================
    Methods
  ===================================================================================
  */

  /**
   * Ensure that a particular token entry has all of the necessary properties
   *
   * @param  {Object]} item - Token object
   * @return {Boolean} - True if all properties are in @item
   */
  hasCompleteData(item) {
    const requiredProperties = ['image', 'name', 'symbol', 'current_price', 'total_volume', 'price_change_percentage_24h', 'market_cap']
    return requiredProperties.reduce((a, b) => {
      return a && b in item
    }, true)
  }

  /**
   * Handle the sorting of items within a Vuetify v-data-table.
   * See: https://vuetifyjs.com/en/components/data-tables (custom-sort)
   */
  customSort(items, index, isDescending) {
    items.sort((a, b) => {
      switch (index) {
        case 'marketCap':
          return isDescending ? b.market_cap - a.market_cap : a.market_cap - b.market_cap
        case 'price':
          return isDescending ? b.current_price - a.current_price : a.current_price - b.current_price
        case 'volume':
          return isDescending ? b.total_volume - a.total_volume : a.total_volume - b.total_volume
        case 'change':
          return isDescending ? b.price_change_percentage_24h - a.price_change_percentage_24h : a.price_change_percentage_24h - b.price_change_percentage_24h
      }
    })

    return items
  }

  tokenLink(tokenAddress) {
    return `/token/0x${tokenAddress}`
  }

  /*
  ===================================================================================
    Computed Values
  ===================================================================================
  */

  /**
   * Filter out tokens with incomplete data
   *
   * @return {Array} - Filtered tokens[] array
   */
  get filteredTokens() {
    return this.tokens.filter(item => {
      return this.hasCompleteData(item)
    })
  }

  /**
   * Headers object required for Vuetify data table.
   * See: https://vuetifyjs.com/en/components/data-tables
   *
   * @return {Array} - Header values. See description.
   */
  get headers() {
    return [
      {
        text: this.$i18n.t('tableHeader.token'),
        align: 'left',
        sortable: false,
        value: 'name'
      },
      {
        text: this.$i18n.t('tableHeader.price'),
        value: 'price'
      },
      {
        text: '%Change',
        value: 'change'
      },
      {
        text: 'Volume (24H)',
        value: 'volume'
      },
      {
        text: this.$i18n.t('tableHeader.marketCap'),
        value: 'marketCap',
        align: 'right'
      }
    ]
  }
}
</script>
