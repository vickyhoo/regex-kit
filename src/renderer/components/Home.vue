<template>
  <v-container fluid grid-list-md fill-height>
    <v-layout row wrap>
      <v-flex d-flex xs8>
        <v-layout row wrap column>
          <v-flex class="pattern-container">
            <expression-editor />
          </v-flex>
          <v-flex class="text-container">
            <text-editor />
          </v-flex>
        </v-layout>
      </v-flex>
      <v-flex xs4>
        <v-expansion-panel popout>
          <v-expansion-panel-content v-for="(item,i) in 5" :key="i">
            <div slot="header">Item</div>
            <v-card>
              <v-card-text v-text="lorem.slice(0, 70)"></v-card-text>
            </v-card>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-flex>
    </v-layout>
  </v-container>
</template>


<script>
import TextEditor from './TextEditor';
import ExpressionEditor from './ExpressionEditor';

export default {
  name: 'Home',
  components: {
    TextEditor,
    ExpressionEditor
  },
  data: () => ({
    lorem:
      'Lorem ipsum dolor sit amet, mel at clita quando. Te sit oratio vituperatoribus, nam ad ipsum posidonium mediocritatem, explicari dissentiunt cu mea. Repudiare disputationi vim in, mollis iriure nec cu, alienum argumentum ius ad. Pri eu justo aeque torquatos.'
  })
};
</script>

<style scoped>
.container {
  padding: 5px;
}

.editor-layout {
  display: flex;
  flex: auto !important;
  flex-direction: column;
  -webkit-box-direction: normal;
  -webkit-box-orient: vertical;
}

.pattern-container {
  flex: 0 0 auto;
}

.text-container {
  flex: auto;
  position: relative;
}

</style>

