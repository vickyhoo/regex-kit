<template>
  <v-layout row>
    <v-flex class="left-container">
      /
    </v-flex>
    <v-flex class="pattern-container">
      <pattern-editor />
    </v-flex>
    <v-flex class="right-container">
      <flags-editor />
    </v-flex>
  </v-layout>
</template>

<script>
import FlagsEditor from './FlagsEditor';
import PatternEditor from './PatternEditor';

export default {
  name: 'expression-editor',
  components: {
    FlagsEditor,
    PatternEditor
  }
};
</script>

<style>
.left-container {
  flex: 0 0 auto;
}

.pattern-container {
  flex: auto;
  position: relative;
}

.right-container {
  flex: 0 0 auto;
}
</style>
