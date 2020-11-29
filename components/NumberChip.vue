<template>
  <v-chip :color="getColor()" dark>
    {{ formatedNumber }}
  </v-chip>
</template>

<script>
export default {
  props: {
    number: {
      type: Number,
      required: true,
    },
  },
  computed: {
    formatedNumber() {
      return String(this.number).padStart(2, '0')
    },
  },
  methods: {
    getColor() {
      let color = ''
      switch (this.number % 7) {
        case 0:
          color = 'red'
          break
        case 1:
          color = 'orange'
          break
        case 2:
          color = 'yellow'
          break
        case 3:
          color = 'green'
          break
        case 4:
          color = 'blue'
          break
        case 5:
          color = 'purple'
          break
        case 6:
          color = 'pink lighten-3'
          break
      }
      return color
    },
  },
}
</script>
