<template>
  <!--
  =====================================================================================
    LOADING
  =====================================================================================
  -->
  <div v-if="isLoading">
    <v-layout column align-center justify-center ma-3>
      <v-card-title class="primary--text text-xs-center body-2 pb-4">Loading...</v-card-title>
      <v-icon class="fa fa-spinner fa-pulse fa-4x fa-fw primary--text" large />
    </v-layout>
  </div>
  <!--
  =====================================================================================
    SLOT
  =====================================================================================
  -->
  <div v-else>
    <slot />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
@Component
export default class AppLoading extends Vue {
  @Prop(Boolean) isLoading: boolean
}
</script>
