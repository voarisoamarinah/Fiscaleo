// import { createApp } from 'vue'
// import App from './App.vue'
// import router from './router'

// createApp(App)
//     .use(router)
//     .mount('#app')

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChartBar, faBalanceScale, faBook, faFileImport, faSignOutAlt, faSearch, faSun, faMoon, faTrashRestore } from '@fortawesome/free-solid-svg-icons'

library.add(faChartBar, faBalanceScale, faBook, faFileImport, faSignOutAlt, faSearch, faSun, faMoon, faTrashRestore )

const app = createApp(App)

app.use(router)
app.mount('#app')
app.component('font-awesome-icon', FontAwesomeIcon)
