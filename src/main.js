import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* add some pro styles */
import { faArrowDown, faBars, faChevronLeft, faChevronRight, faDownload, faPlay, faQuestion, faTrash, faXmark, faXmarkCircle } from '@fortawesome/free-solid-svg-icons'


/* add each imported icon to the library */
library.add(faQuestion,faBars, faXmark,faTrash,faChevronLeft, faPlay,faChevronRight,faArrowDown,faDownload)

createApp(App).component('font-awesome-icon', FontAwesomeIcon).mount('#app')
