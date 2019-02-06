<template>
  <v-container grid-list-lg>
    <app-error :has-error="hasError" :message="errorMessage" />
    <app-bread-crumbs :new-items="crumbs" />
    <app-loading :is-loading="isLoading">
      <slot />
    </app-loading>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Crumb } from '@app/core/components/props'
import AppError from '@app/core/components/ui/AppError.vue'
import AppLoading from '@app/core/components/ui/AppLoading.vue'
import AppBreadCrumbs from '@app/core/components/ui/AppBreadCrumbs.vue'

@Component({
  components: {
    AppError,
    AppLoading,
    AppBreadCrumbs
  }
})
export default class AppPageBase extends Vue {
  @Prop(Boolean) hasError: boolean
  @Prop(String) errorMessage: string
  @Prop(Boolean) isLoading: boolean
  @Prop(Array) crumbs!: Crumb[]
}
</script>
