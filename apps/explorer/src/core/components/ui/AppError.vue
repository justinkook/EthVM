<template>
  <div v-if="hasError">
    <v-card flat class="pa-5">
      <v-layout class="error--text display-2 justify-center align-center">
        <i class="fas fa-exclamation-circle text-lg-center mr-3 mb-2"></i>{{ errorText }}
      </v-layout>
      <!-- <v-layout class="justify-center"><img src="https://media.giphy.com/media/cegWQ66TiGYDK/giphy.gif"/></v-layout> -->
      <v-layout class="title justify-center">
        <v-card-text class="title text-md-center">{{ message }}</v-card-text>
      </v-layout>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class AppError extends Vue {
  @Prop(Boolean) hasError: boolean
  @Prop(String) message: string

  get errorText() {
    return this.$i18n.t('message.err')
  }
}
</script>
