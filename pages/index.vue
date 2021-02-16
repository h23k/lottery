<template>
  <v-row justify="center">
    <v-col cols="12">
      <v-tabs v-model="tab" align-with-title>
        <v-tabs-slider color="yellow"></v-tabs-slider>
        <v-tab v-for="item in items" :key="item.name">
          {{ item.label }}
        </v-tab>
      </v-tabs>
      <v-tabs-items v-model="tab">
        <v-tab-item v-for="item in items" :key="item.name">
          <Loto :type="item.type" />
        </v-tab-item>
      </v-tabs-items>
    </v-col>
  </v-row>
</template>

<script>
import Loto from '~/components/Loto.vue'

export default {
  components: {
    Loto,
  },
  data: () => ({
    tab: null,
    items: [
      {
        name: 'loto6',
        label: 'ロト６',
        type: 6,
      },
      {
        name: 'loto7',
        label: 'ロト７',
        type: 7,
      },
    ],
  }),
}
</script>
