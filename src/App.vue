<script>
import { run_bayes } from './JS/SpamClassifier';
import { MathJax } from 'mathjax-vue3'

export default {
  components: {
    MathJax,
  },
  data() {
    return {
      test_text: '',
      data: null,
      positive_input: '',
      negative_input: '',
      examples: [],
      sidebar: false,
      comment: '',
      stepTitle: '',
      selectedStepId: null,
      steps: [],
      stepData: {},
      menu: 'home',
      routines: [],
      routine: null,
      json: null,
      routineTitle: '',
      routineNameError: false,
      showInfo: false,
      infoPage: 'info',
    }
  },
  methods: {
    run_bayes() {
      this.data = run_bayes(this.examples, { test_text: this.test_text })
    },
    addPosExample() {
      this.examples.push({ id: 'p' + this.examples.length, test_text: this.positive_input, class: 1 })
      this.positive_input = ''
      this.run_bayes()

    },
    addNegExample() {
      this.examples.push({ id: 'n' + this.examples.length, test_text: this.negative_input, class: 0 })
      this.negative_input = ''
      this.run_bayes()

    },
    deleteExample(id) {
      this.examples = this.examples.filter((obj) => obj.id !== id);
      this.negative_input = ''
      this.run_bayes()

    },
    inVocab(word) {
      return this.data?.logLikelihood[word.toLowerCase()]?.['1'] == this.data?.logLikelihood[word.toLowerCase()]?.['0'] && this.data?.logLikelihood[word.toLowerCase()]?.['0'] > 0
    },
    isPositive(word) {
      return this.data?.logLikelihood[word.toLowerCase()]?.['1'] > this.data?.logLikelihood[word.toLowerCase()]?.['0']
    },
    isNegative(word) {
      return this.data?.logLikelihood[word.toLowerCase()]?.['1'] < this.data?.logLikelihood[word.toLowerCase()]?.['0']
    },
    updateTestInput(e) {
      this.test_text = e.target.value
      this.run_bayes()
    },
    updatePosInput(e) {
      this.positive_input = e.target.value
      this.run_bayes()
    },
    updateNegInput(e) {
      this.negative_input = e.target.value
      this.run_bayes()
    },
    addStep() {
      // For whatever reason (reactivity or something with references being stored instead of values), one has to add arrays as [...this.examples] instead of just this.examples, otherwise any updates afterwards will affect all array properties that point to this.examples
      this.selectedStepId = this.steps.length

      this.steps.push({ id: this.selectedStepId, examples: [...this.examples], negative_input: this.negative_input, positive_input: this.positive_input, comment: this.comment, stepTitle: this.stepTitle, test_text: this.test_text })
      this.comment = ''
      this.stepTitle = ''

      this.scrollToStep()

    },
    deleteStep(step) {
      this.steps.pop(this.steps.indexOf(step))
    },
    deleteRoutine(routine) {
      this.routines.pop(this.routines.indexOf(routine))
    },
    setStep(step) {
      this.selectedStepId = step.id
      this.comment = step.comment
      this.examples = [...step.examples]
      this.test_text = step.test_text
      this.negative_input = step.negative_input
      this.positive_input = step.positive_input
      this.run_bayes()
    },
    setRoutine(routine) {
      this.routine = routine
      this.menu = 'run_routine'
      this.selectedStepId = 1;
      this.setStep(routine.steps[0])
    },
    createRoutine() {
      this.comment = ''
      this.stepTitle = ''
      this.steps = []
      this.routineTitle = ''
      this.menu = 'create_routine'

    },
    downloadRoutine(routine) {
      let text = JSON.stringify(routine);
      let filename = `${routine.name}.json`;
      let element = document.createElement('a');
      element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();
      document.body.removeChild(element);
    },
    saveRoutine() {
      // credit: https://www.bitdegree.org/learn/javascript-download
      this.routines.push({ name: this.routineTitle, steps: this.steps })

      this.comment = ''
      this.title = ''
      this.menu = 'home'
    },
    toggleInfo() {
      this.showInfo = !this.showInfo
      this.infoPage = 'info'
    },
    jsonCallback(e) {
      let data = e.target.result;
      this.routines.push(JSON.parse(data));
      this.$refs.fileupload.value = null;

    },
    async importJSON(e) {
      // Read the file
      for (let i = 0; i < e.target.files.length; i++) {
        let reader = new FileReader();

        // Setup the callback event to run when the file is read
        reader.onload = this.jsonCallback;
        await reader.readAsText(e.target.files[i]);
      }

    },
    scrollToStep() {
      //Next tick waits till changes are reflected in the DOM, this is needed because we want the most recent scroll height after adding a new step
      this.$nextTick(
        () => (this.$refs.scrollToMe.scrollTop = this.$refs.scrollToMe.scrollHeight)
      );
    }

  },

}
</script>
<template>
  <div v-if="showInfo"
    class="absolute h-[calc(100dvh)] w-[calc(100dvw)] bg-black z-10 bg-opacity-50 flex items-center justify-center min-h-[600px]"
    @click="toggleInfo">
    <div class="bg-white w-[80%] max-h-[600px] max-w-[600px] h-[90%] rounded-md grid grid-rows-[60px,1fr] grid-cols-[1fr]"
      @click.stop>
      <div class="flex justify-around bg-gray-200 rounded-t-md">
        <div
          :class="{ 'w-[50%] bg-gray-200 p-4 text-center text-gray-400 rounded-tl-md  hover:text-gray-500  hover:bg-gray-300 cursor-pointer': infoPage != 'info', 'p-4 w-[50%] text-gray-600 text-center rounded-t-md bg-white': infoPage == 'info' }"
          @click="infoPage = 'info'">Info</div>
        <div
          :class="{ 'w-[50%] bg-gray-200 p-4 text-center text-gray-400 hover:text-gray-500  hover:bg-gray-300 cursor-pointer': infoPage != 'instructions', 'p-4 w-[50%] text-gray-600 text-center rounded-t-md bg-white': infoPage == 'instructions' }"
          @click="infoPage = 'instructions'">Guide</div>
        <div
          :class="{ 'w-[50%] bg-gray-200 p-4 text-center text-gray-400 rounded-tr-md hover:bg-gray-300 hover:text-gray-500 cursor-pointer': infoPage != 'theory', 'p-4 w-[50%] text-gray-600 rounded-tr-md bg-white text-center rounded-tl-md': infoPage == 'theory' }"
          @click="infoPage = 'theory'">Theory</div>
      </div>
      <div v-if="infoPage == 'instructions'"
        class="flex flex-col items-center  text-gray-500 justify-evenly gap-4 overflow-hidden sm:text-base text-sm md:p-8 py-4">

        <div class="flex flex-col items-center gap-4 justify-center">
          <div class="bg-blue-400 text-white flex items-center justify-center p-4 h-8 w-8 rounded-3xl">1</div>
          <p class="px-4 w-full text-center max-w-[40ch]">Add some training examples (words or sentences) to the positive
            and negative class. Press ENTER to add an example.</p>
        </div>
        <div class="flex flex-col items-center gap-4 justify-center max-w-20">
          <div class="bg-blue-400 text-white flex items-center justify-center p-4 w-8  h-8 rounded-3xl">2</div>
          <p class="text-center px-4 max-w-[40ch]">Add a new 'Test Sentence' and notice how the probability of the text
            belonging to each class changes depending on the content.</p>
        </div>
        <div class="flex flex-col items-center gap-4 justify-center max-w-10">
          <div class="bg-blue-400 text-white flex items-center justify-center p-4 h-8 w-8 rounded-3xl">3</div>
          <p class="text-center px-4 max-w-[40ch]">Hover over each word in the 'Word Likelihood' section to see their
            individual contribution to the overall sentiment prediction.</p>
        </div>

        <p class="text-center flex justify-center items-center px-4 max-w-[40ch]">Create a 'Routine' in the
          top-left<font-awesome-icon icon="fa-solid fa-bars" class="text-gray-500 mx-2" size="lg" />menu.</p>

      </div>
      <div class="overflow-hidden sm:text-base text-sm" v-if="infoPage == 'info'">
        <div class="py-4 flex flex-col items-center text-center">
          <p class="mb-2 text-gray-500">Created and maintained by:</p>
          <p class="font-medium text-gray-700 text-lg">Axel Sorensen</p>
          <a class="text-purple-600" href="https://github.com/AxelSorensen"
            target="_blank">https://github.com/AxelSorensen</a>
          <a class="text-purple-600" href="https://www.linkedin.com/in/axel-sorensen/"
            target="_blank">https://www.linkedin.com/in/axel-sorensen/</a>
        </div>
        <div class="p-4 flex flex-col items-center text-center">
          <p class="mb-2 text-gray-500">Useful links:</p>

          <a class="text-purple-600 mb-2"
            href="https://www.youtube.com/watch?v=O2L2Uv9pdDA&ab_channel=StatQuestwithJoshStarmer"
            target="_blank">Youtube: Naive Bayes, Clearly Explained</a>
          <a class="text-purple-600" href="https://web.stanford.edu/~jurafsky/slp3/4.pdf" target="_blank">Speech and
            Language Processing, Chapter 4</a>
        </div>

        <div class="p-4 flex flex-col items-center text-center">
          <p class="mb-2 text-gray-500">Source code:</p>

          <a class="text-purple-600" href="https://github.com/AxelSorensen/Naive-Bayes-Classifier" target="_blank">Naive
            Bayes Classifier [Github]</a>
        </div>
        <div class="p-4 flex flex-col items-center text-center">
          <p class="mb-2 text-gray-500">Contribution:</p>

          <p class="px-4 max-w-[40ch]">Questions, suggestions and corrections are more than welcome at:</p>
          <a class="text-purple-600" href="mailto:axelsorensenwork@gmail.com">axelsorensenwork@gmail.com</a>

        </div>


      </div>
      <div v-if="infoPage == 'theory'"
        class=" text-gray-500 gap-4 overflow-scroll sm:text-base text-sm md:p-8  p-4 text-center flex flex-col items-center">
        <div class="flex flex-col items-center max-w-[40ch]">
          <p class="mb-2 text-gray-500 ">A <b>Naive Bayes Classifier</b> is a simple model that can be used to predict a
            given sentence's probability of belonging to a certain class.</p>

          <p class="mb-2 text-gray-500 ">The 'Naive' in 'Naive Bayes' refers to the fact that some simplifying assumptions
            need to be made:</p>
          <br>
          <p><b>The 'bag of words' assumption</b> assumes that the order or position of the words don't matter, only the
            frequency in which they occur. This means that 'The mouse eats cheese' and 'The cheese eats mouse' wouldn't be
            different to the model.</p>
          <br>
          <p><b>The Naive Bayes assumption</b> assumes that the probability of a word occurring is independent of the
            context it appears in.</p>
          <br>
          <p>Given a document <i>d</i> the most probable class <i>c</i> is determined by the equation:</p>
          <br>
          <math-jax class="text-center"
            latex="        \hat{c} = \underset{c \in C}{\operatorname{argmax}} \;\;\; \overbrace{P(c)}^\text{prior} \;  \overbrace{P(d\mid c)}^\text{likelihood} " />
          <br>
          <p>A document can be a word, a sentence or a body of text. The document <i>d</i> can be represented as the
            number of words it contains:</p>
          <br>
          <math-jax class="text-center"
            latex="        \hat{c} = \underset{c \in C}{\operatorname{argmax}} \;\;\; \overbrace{P(c)}^\text{prior} \;  \overbrace{P(f_1,f_2,...,f_n\mid c)}^\text{likelihood} " />
          <br>
          <p>The prior probability is the probability of a certain class <i>c</i> occurring. This is based on the training
            examples that the model has seen so far. The prior probability can be calculated by dividing the number of
            documents in the training examples in class <i>c</i> by the total number of documents: </p>
          <br>
          <math-jax class="text-center" latex="\hat{P}(c)=\frac{N_{c}}{N_{doc}}" />
          <br>
          <p>The likelihood of a given word <i>w<sub>i</sub> </i> occuring given a document of class <i>c</i> can be
            defined by:</p>
          <br>
          <math-jax class="text-center"
            latex="\hat{P}(w_i \mid c) = \frac{count(w_i,c) + 1}{(\sum_{w \in V}count(w,c))+\left | V \right | } " />
          <br>
          <p>Where <i>w<sub>i</sub></i> is the word at position <i>i</i> in the test document, the numerator is the number
            of times that <i>w<sub>i</sub></i> occurred in a document of class <i>c</i> (1 count is added in order to
            avoid situations where the count is 0), and the denominator is the number of words in all documents of class
            <i>c</i> plus the length of the vocabulary V (the number of unique words in all documents of all classes)
          </p>
          <br>
          <p>In order to predict the sentiment of a sentence <i>s</i> , for each class<i>c</i> the prior probability of
            class c is multiplied by the likelihood of each word in the sentence, belonging to class <i>c</i>. Sentence
            <i>s</i> is most likely to belong to the class that returns the highest value. These values are not
            probabilities, so in order to convert them into a probability distribution, a softmax function is used.
          </p>
          <br>
          <p>For a more detailed explanation, refer to:</p><a class="text-purple-600"
            href="https://web.stanford.edu/~jurafsky/slp3/4.pdf" target="_blank">Speech and Language Processing, Chapter
            4</a>
          <br>
          <p> I hope this interactive Explorable helps you understand the underlying concepts of Naive Bayes
            Classification better.Play around and see what you discover!</p>

        </div>
      </div>


      <div
        class="text-center m-4 p-2 text-gray-500 rounded-b-md bg-gray-100 hover:text-gray-600 hover:bg-gray-200 cursor-pointer"
        @click="toggleInfo">Close</div>
    </div>

  </div>
  <div class="grid grid-rows-[50px,1fr] overflow-hidden h-[calc(100dvh)] md:grid-cols-[300px,1fr] grid-cols-[1fr]">
    <div class="bg-gray-100 flex justify-between items-center col-span-2 w-screen border-b-2">

      <div @click="sidebar = !sidebar" class="group p-4 hover:cursor-pointer w-7">
        <font-awesome-icon v-if="sidebar" icon="fa-solid fa-xmark" class="text-gray-500 group-hover:text-gray-700"
          size="lg" />
        <font-awesome-icon v-else icon="fa-solid fa-bars" class="text-gray-500 group-hover:text-gray-700" size="lg" />

      </div>
      <h1 class="text-gray-400 font-medium">Naive Bayes Classifier</h1>
      <div
        class="bg-gray-300 text-center w-7 h-7 justify-center flex items-center rounded-3xl cursor-pointer mr-4 hover:bg-gray-400 group"
        @click="toggleInfo">
        <font-awesome-icon icon="fa-solid fa-question" class="text-gray-500 group-hover:text-white" size="md" />
      </div>

    </div>
    <div v-if="sidebar" class="overflow-hidden bg-gray-100">
      <div v-if="menu == 'run_routine'"
        class=" grid grid-rows-[min-content,3fr,min-content] grid-cols-1 w-full p-4 gap-4 justify-between h-full">
        <div @click="menu = 'home'"
          class=" absolute flex items-center justify-center w-10 m-[-8px]  h-10 group cursor-pointer">
          <font-awesome-icon icon="fa-solid fa-chevron-left" class=" text-gray-400 group-hover:text-gray-500" size="md" />
        </div>
        <p class="text-center text-gray-500">{{ routine.name }}</p>
        <div class="flex flex-col gap-2 overflow-y-scroll w-[calc(100%+7px)]">
          <div v-for="step in routine.steps"
            :class="{ 'cursor-pointer border-2 border-blue-500 bg-blue-200 hover:bg-blue-200 w-full text-center p-2 px-4 flex justify-between rounded-md': selectedStepId == step.id, 'bg-gray-200 w-full text-center p-2 px-4 flex justify-between rounded-md cursor-pointer hover:bg-gray-300 hover:border-gray-300 border-2 text-gray-500 border-gray-200': selectedStepId != step.id }"
            @click="() => setStep(step)">
            <p>{{ step.id + 1 }}.</p>
            <p>{{ step.stepTitle }}</p>
          </div>
        </div>
        <div class="flex flex-col items-center gap-2">
          <p>Comments</p>
          <p class="w-full bg-gray-200 rounded-md outline-none p-4 text-sm overflow-scroll h-48 text-gray-500">{{
            routine.steps[selectedStepId]?.comment || '...' }}</p>
        </div>
        <div class="flex justify-evenly items-center">
          <div class="p-2 px-8"
            :class="{ 'text-gray-300 hover:text-gray-300 cursor-default': selectedStepId == 0, 'text-gray-500 hover:text-gray-700 cursor-pointer': selectedStepId != 0 }"
            @click="() => { if (selectedStepId >= 1) { setStep(routine.steps[selectedStepId - 1]) } }">
            <font-awesome-icon icon="fa-solid fa-chevron-left" size="md" />
          </div>
          <p class="text-gray-500 tracking-widest">{{ selectedStepId + 1 }} of {{ routine?.steps.length }}</p>
          <div class="p-2 px-8"
            :class="{ 'text-gray-300 hover:text-gray-300 cursor-default': selectedStepId == routine.steps.length - 1, 'text-gray-500 hover:text-gray-700 cursor-pointer': selectedStepId != routine.steps.length - 1 }"
            @click="() => { if (selectedStepId < routine.steps.length - 1) { setStep(routine.steps[selectedStepId + 1]) } }">
            <font-awesome-icon icon="fa-solid fa-chevron-right" size="md" />
          </div>

        </div>
      </div>
      <div v-if="menu == 'home'"
        class=" grid grid-rows-[min-content,1fr,min-content] grid-cols-1 w-full p-4 gap-4 justify-between h-full">
        <p class="text-center text-gray-500">Routines</p>
        <div v-if="routines.length == 0" class="items-center flex flex-col gap-4">
          <p class="text-sm text-center text-gray-400 max-w-[60ch]">A routine allows you to record the actions you perform
            in the explorable so you can share and discuss the experiments you make.<br><br>No routines available.<br>
            <b>Import</b> or <b>Create</b> a routine
            below.
          </p>
          <font-awesome-icon icon="fa-solid fa-arrow-down" class="text-gray-400" size="md" />
        </div>
        <div class="overflow-y-scroll w-[calc(100%+7px)]">
          <div class="flex flex-col gap-2 overflow-y-scroll w-[calc(100%+7px)]">

            <div v-for="routine in routines" class="flex items-center gap-4">
              <div @click="() => setRoutine(routine)"
                class="flex w-full gap-4 cursor-pointer bg-gray-200 border-2 hover:bg-gray-300 hover:border-gray-300 text-gray-400 justify-between items-center p-2 px-4 rounded-md group">
                <font-awesome-icon icon="fa-solid fa-play" class=" text-gray-400 group-hover:text-blue-500 cursor-pointer"
                  size="md" />
                <p class="line-clamp group-hover:text-gray-600">{{ routine.name }}</p>

              </div>
              <div @click="() => downloadRoutine(routine)">
                <font-awesome-icon icon="fa-solid fa-download" class="text-gray-400 hover:text-blue-500 cursor-pointer"
                  size="md" />

              </div>
              <div @click="() => deleteRoutine(routine)">
                <font-awesome-icon icon="fa-solid fa-trash" class="text-gray-400 hover:text-red-500 cursor-pointer"
                  size="md" />

              </div>

            </div>
          </div>

        </div>
        <input type="file" ref="fileupload" multiple
          class="w-[calc(100%)] custom-file-input h-14 bg-gray-200 border-2 border-dashed border-gray-500 rounded-md cursor-pointer hover:bg-gray-300  text-gray-500"
          @change="(e) => importJSON(e)" />
        <div>
          <div class="bg-blue-400 text-white w-full text-center p-2 rounded-md hover:bg-blue-500 cursor-pointer"
            @click="createRoutine">Create Routine</div>
        </div>
      </div>
      <div v-if="menu == 'create_routine'"
        class="grid grid-rows-[min-content,3fr,1fr] grid-cols-1 w-full p-4 gap-4 justify-between h-full">
        <div @click="menu = 'home'"
          class="flex items-center justify-center w-10 m-[-8px]  h-10 absolute group cursor-pointer">
          <font-awesome-icon icon="fa-solid fa-chevron-left" class=" text-gray-400 group-hover:text-gray-500 "
            size="md" />
        </div>
        <p class="text-center text-gray-500">Steps</p>

        <div class="flex-col flex overflow-scroll w-[calc(100%+7px)] gap-2 place-items-start" ref="scrollToMe">
          <div class="flex flex-col w-full gap-2 h-full">
            <div v-if="steps.length == 0" class="items-center flex flex-col gap-4 w-full overflow-hidden">
              <p class="text-sm text-center text-gray-400 max-w-[60ch]">Adding a step allows you to save the current state
                of the explorable. You can use multiple steps and add comments to convey the concepts you
                discover.<br><br>No steps added.<br>Make a <b>Change</b> and <b>Add</b> a step below.
              </p>
              <font-awesome-icon icon="fa-solid fa-arrow-down" class="text-gray-400" size="md" />
            </div>
            <div v-for="step in steps" class="flex w-full items-center gap-2">
              <div
                :class="{ 'cursor-pointer border-2 border-blue-500 bg-blue-200 hover:bg-blue-200 text-gray-600  w-full text-center p-2 px-4 flex justify-start rounded-md gap-2': selectedStepId == step.id, 'bg-gray-200 w-full text-center p-2 px-4 flex justify-start gap-2 rounded-md cursor-pointer hover:bg-gray-300 hover:border-gray-300 border-2 hover:text-gray-600 text-gray-400  border-gray-200': selectedStepId != step.id }"
                @click="() => setStep(step)">
                <p>{{ step.id + 1 }}.</p>
                <p>{{ step.stepTitle }}</p>
              </div>
              <div @click="() => deleteStep(step)">
                <font-awesome-icon icon="fa-solid fa-trash" class="text-gray-400 hover:text-red-500 cursor-pointer"
                  size="md" />
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col w-full gap-4 h-full">

          <input v-model="stepTitle" class="w-full bg-gray-200 resize-none rounded-md outline-none p-4 text-sm"
            placeholder="Add Step Title (Optional)" />
          <textarea v-model="comment" class="w-full bg-gray-200 resize-none rounded-md h-48 outline-none p-4 text-sm"
            placeholder="Add a comment, observation, instruction or thought etc. (Optional)" />
          <div class="bg-blue-400 text-white w-full text-center p-2 rounded-md hover:bg-blue-500 cursor-pointer"
            @click="addStep">Add step</div>
          <div class="flex gap-4">
            <input v-model="routineTitle"
              class="w-full bg-gray-200 resize-none rounded-md outline-none p-2 border-2 border-gray-200 text-sm"
              :class="{ 'border-2 border-red-400': routineNameError }" placeholder="Routine Name"
              @input="routineNameError = false" />
            <div class="hover:bg-purple-600 w-28 bg-purple-500 text-white text-center p-2 rounded-md cursor-pointer"
              @click="() => {
                  if (routineTitle) { saveRoutine() } else {
                    routineNameError = true;
                  }
                }">Save</div>

          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-rows-[6fr,1fr,1fr,1fr] p-4 gap-4 divide-y overflow-hidden grid-cols-[1fr] md:visible"
      :class="{ 'col-span-2': !sidebar, 'md:visible hidden md:inline-grid': sidebar }">
      <div class="flex flex-col items-center gap-4 overflow-hidden">
        <p class=" text-gray-400">Training Examples</p>
        <div class="w-full flex flex-row h-full overflow-hidden gap-4">
          <div class="w-full flex flex-col h-full">
            <p class="bg-green-500 text-white text-center p-2 rounded-t-md">Positive</p>
            <div class="overflow-hidden w-full bg-gray-100 rounded-md p-4 gap-4 flex-col flex h-full">
              <input class="w-full rounded-md bg-gray-200 outline-none p-2" type="search" @keydown.enter="addPosExample"
                enterkeyhint="done" :value="positive_input" @input="e => updatePosInput(e)">
              <div class="gap-x-2 overflow-y-scroll flex-wrap flex ">
                <template v-for="(example, index) in examples.slice().reverse()">
                  <div v-if="example.class == 1"
                    class="min-h-10 p-2 bg-green-500 rounded-md mb-2 text-white overflow-hidden hover:bg-green-600 cursor-pointer"
                    @click="() => deleteExample(example.id)">
                    {{
                      example.test_text }}</div>

                </template>
              </div>
            </div>
          </div>
          <div class="w-full flex flex-col h-full">
            <p class="bg-red-500 text-white text-center p-2 rounded-t-md">Negative</p>
            <div class="overflow-hidden w-full bg-gray-100 rounded-md p-4 gap-4 flex-col flex h-full">
              <input class="w-full rounded-md bg-gray-200 outline-none p-2" type="search" @keydown.enter="addNegExample"
                enterkeyhint="done" :value="negative_input" @input="e => updateNegInput(e)">
              <div class="gap-x-2  overflow-y-scroll flex-wrap flex w-[calc(100%+7px)]">
                <template v-for="example in examples.slice().reverse()">
                  <div v-if="example.class == 0"
                    class="min-h-10 p-2 bg-red-500 rounded-md mb-2 text-white overflow-hidden hover:bg-red-600 cursor-pointer"
                    @click="() => deleteExample(example.id)">
                    {{
                      example.test_text }}</div>

                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col justify-start items-center gap-4 p-2">
        <p class="text-gray-400">Probabilities</p>
        <div class="grid grid-cols-[100px,1fr,100px] gap-2  w-full text-center items-center text-gray-700">
          <p class="">Negative</p>
          <div class="bg-gray-100 h-4 w-full rounded-md">
            <div class="bg-red-500 h-full rounded-md t"
              :style="{ width: data ? 'calc(' + data.probability[0] + ' * 100%)' : 0 }"></div>
          </div>
          <p class="">{{ data ? parseFloat((data.probability[0] * 100).toFixed(2)) : 0 }}%</p>
        </div>
        <div class="grid grid-cols-[100px,1fr,100px] gap-2 w-full text-center items-center text-gray-700">
          <p class="">Positive</p>
          <div class="bg-gray-100 h-4 w-full rounded-md">
            <div class="bg-green-500 h-full rounded-md"
              :style="{ width: data ? 'calc(' + data.probability[1] + ' * 100%)' : 0 }"></div>
          </div>
          <p class="">{{ data ? parseFloat((data.probability[1] * 100).toFixed(2)) : 0 }}%</p>
        </div>
      </div>
      <div class="flex flex-col items-center justify-start gap-4 p-2">
        <p class="text-gray-400">Test sentence</p>
        <input :value="test_text" @input="e => updateTestInput(e)" class="bg-gray-200 p-4 rounded-md outline-none w-[60%]"
          type="text" enterkeyhint="done" placeholder="Type a new message">
      </div>
      <div class="flex flex-col items-center justify-start gap-4 p-2">
        <p class="text-gray-400">Word likelihood</p>
        <div class="w-full flex flex-wrap justify-center gap-y-2 break-all">
          <div
            :class="{ 'bg-gray-400 text-white px-2 mx-1 tooltip': inVocab(word), 'bg-green-500 text-white px-2 mx-1 tooltip': isPositive(word), 'bg-red-500 text-white px-2 mx-1 tooltip': isNegative(word) }"
            class="rounded-md m-1" v-for="word in test_text.split(' ')">{{ test_text ? word : '...'
            }}<span v-if="data?.logLikelihood[word.toLowerCase()]"
              class="tooltiptext p-2 break-words rounded-md text-sm">- {{
                (data?.logLikelihood[word.toLowerCase()]?.['0'] * 100).toFixed(2) }} %<br> + {{
    (data?.logLikelihood[word.toLowerCase()]?.['1'] * 100).toFixed(2) }} %</span></div>
        </div>
      </div>
    </div>
</div></template>
