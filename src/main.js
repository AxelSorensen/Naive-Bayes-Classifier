import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import MathJax, { initMathJax, renderByMathjax } from 'mathjax-vue3'

// Rewrite pageReady method, optimizing MathJax as required rendering and render to avoid them
// ❗️❗️ For example '<span>$$Not a formula$$</span>' is not going to render, but in fact will be rendered into formula， As below is not the el

function onMathJaxReady() {
  // The parent node of need to be rendered into the formula node set
  const el = document.getElementById('elementId')
  // ❗️❗️ When there is no el will begin to render the default root node
  renderByMathjax(el)
}

initMathJax({}, onMathJaxReady)



/* add some pro styles */
import { faArrowDown, faBars, faChevronLeft, faChevronRight, faDownload, faPlay, faQuestion, faTrash, faXmark, faXmarkCircle } from '@fortawesome/free-solid-svg-icons'


/* add each imported icon to the library */
library.add(faQuestion,faBars, faXmark,faTrash,faChevronLeft, faPlay,faChevronRight,faArrowDown,faDownload)

createApp(App).use(MathJax).component('font-awesome-icon', FontAwesomeIcon).mount('#app')
