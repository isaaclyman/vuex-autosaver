//
// A fake API storage utility using LocalStorage
//
var storageKey = 'content'
var api = {
  load: function () {
    var json = window.localStorage.getItem(storageKey) || JSON.stringify('')
    return JSON.parse(json)
  },
  // We debounce "save()" so it will never be called more than once per second
  //  or less than once every three seconds (when there are changes to save)
  save: _.debounce(function (content, callback) {
    window.localStorage.setItem(storageKey, JSON.stringify(content))
    callback()
  }, 1000, { maxWait: 3000 })
}

//
// Autosaver plugin
//
var autosaverPlugin = function (store) {
  // Load the user's saved work
  store.commit('UPDATE_CONTENT', api.load())

  // Every time the state changes, check the mutation type and save the results
  store.subscribe(function (mutation, state) {
    if (mutation.type === 'UPDATE_CONTENT') {
      store.commit('SET_SAVE_STATUS', 'Saving...')
      api.save(mutation.payload, function () {
        store.commit('SET_SAVE_STATUS', 'Saved')
      })
      return
    }
  })
}

//
// Vuex store
//
var store = new Vuex.Store({
  state: {
    content: '',
    saveStatus: 'Saved'
  },
  mutations: {
    'SET_SAVE_STATUS': function (state, newSaveStatus) {
      state.saveStatus = newSaveStatus
    },
    'UPDATE_CONTENT': function (state, newContent) {
      state.content = newContent
    }
  },
  plugins: [autosaverPlugin]
})

//
// "Saving" indicator
//
Vue.component('saving-indicator', {
  template: '<div>{{ saveStatus }}</div>',
  computed: {
    saveStatus: function () {
      return this.$store.state.saveStatus
    }
  }
})

//
// Text entry box
//
Vue.component('text-entry', {
  template: '<textarea v-model="content" @keyup="registerChange"></textarea>',
  data: function () {
    return {
      content: this.$store.state.content
    }
  },
  methods: {
    registerChange: function () {
      this.$store.commit('UPDATE_CONTENT', this.content)
    }
  }
})

//
// Bootstrap Vue app
//
var app = new Vue({
  el: '#app',
  template: '<div> <saving-indicator></saving-indicator> <text-entry></text-entry> </div>',
  store: store
})