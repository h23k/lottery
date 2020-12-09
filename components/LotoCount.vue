<template>
  <v-col>
    <v-data-table
      v-model="selectRow"
      dense
      show-select
      :hide-default-footer="true"
      caption="出現回数（最近）"
      :headers="numberHeader"
      :items="numbers"
      :items-per-page="numbers.length"
      :sort-by="['luckyRecentCount', 'timesDiff', 'number']"
      :sort-desc="[true, false, false]"
      item-key="number"
    >
      <template
        v-slot:[`item.data-table-select`]="{ item, isSelected, select }"
      >
        <v-simple-checkbox
          :value="isSelected"
          @input="clickCheckBox(item, isSelected, select)"
        ></v-simple-checkbox>
      </template>
      <template v-slot:[`item.number`]="{ item }">
        <NumberChip :number="Number(item.number)" />
      </template>
    </v-data-table>
    <v-divider></v-divider>
    <ChartBar :chart-data="chartBarData" :options="chartBarOptions" />
  </v-col>
</template>

<script>
import { mapState } from 'vuex'
import NumberChip from '@/components/NumberChip'
import ChartBar from '@/components/ChartBar'

export default {
  components: {
    NumberChip,
    ChartBar,
  },
  props: {
    type: {
      type: Number,
      required: true,
    },
    selected: {
      type: Array,
      default: () => {
        return []
      },
    },
  },
  data: () => ({
    selectRow: [],
  }),
  computed: {
    getNumberCount() {
      return this.type === 6 ? 6 : 7
    },
    ...mapState('loto', ['loto6Numbers', 'loto7Numbers']),
    numbers() {
      return this.type === 6 ? this.loto6Numbers : this.loto7Numbers
    },
    numberHeader() {
      return [
        { text: '数字', value: 'number', align: 'center' },
        { text: '出現回数(回)', value: 'luckyRecentCount', align: 'right' },
        { text: '出現率(%)', value: 'luckyRecentRate', align: 'right' },
        { text: '出現差(回前)', value: 'timesDiff', align: 'right' },
      ]
    },
    chartBarData() {
      const data = {
        labels: [],
        datasets: [
          {
            label: ['出現回数'],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 1,
            data: [],
            yAxisID: 'total',
          },
          {
            label: ['出現回数（最近）'],
            backgroundColor: 'rgb(54, 162, 235, 0.2)',
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 1,
            data: [],
            yAxisID: 'recent',
          },
        ],
      }
      this.numbers.forEach((element) => {
        data.labels.push(element.number)
        data.datasets[0].data.push(element.luckyCount)
        data.datasets[1].data.push(element.luckyRecentCount)
      })
      return data
    },
    chartBarOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [
            {
              id: 'total',
              position: 'left',
            },
            {
              id: 'recent',
              position: 'right',
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      }
    },
  },
  beforeUpdate() {
    this.selectRow = this.selected
  },
  methods: {
    clickCheckBox(item, isSelected, select) {
      select(!isSelected)
      this.$emit('setSelected', {
        number: item.number,
        isSelected: !isSelected,
      })
    },
  },
}
</script>
