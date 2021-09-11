<template>
  <section class="text-gray-800">
    <div
      v-if="store"
      class="
        p-4
        my-5
        bg-white
        rounded-md
        shadow-lg
        md:p-6
        flex flex-col
        items-center
        justify-center
      "
    >
      <div class="w-full max-w-xs rounded-lg border">
        <div class="bg-primary-500 text-white text-center h-64 rounded-t-lg">
          <h1 class="pt-8 text-3xl font-bold">Order Online!</h1>
          <p class="pt-10 text-sm">Scan QR to check our products</p>
        </div>

        <div class="-mt-24 flex items-center justify-center">
          <vue-qrcode :value="storeUrl" class="w-48 border rounded-md" />
        </div>

        <div class="text-center h-40">
          <h2 class="pt-5 font-semibold">{{ store.storeName }}</h2>
          <a target="blank" :href="`${store.domain}`" class="mt-4 link">
            {{ store.domain }}
          </a>
          <div class="mt-5 mx-auto max-w-max">
            <img src="/litekart-logo.svg" alt="" class="w-16 h-16" />
          </div>
        </div>
      </div>

      <button
        class="
          mt-10
          py-2
          px-6
          mx-auto
          bg-primary-500
          hover:bg-primary-700
          transition
          duration-300
          transform
          active:scale-95
          rounded-md
          shadow
          hover:shadow-md
          font-semibold
          text-white text-sm
          tracking-wide
          focus:outline-none
        "
      >
        Print PDF
      </button>
    </div>
  </section>
</template>

<script>
import VueQrcode from 'vue-qrcode'
import { mapGetters } from 'vuex'
export default {
  components: { VueQrcode },
  middleware: ['onboarding'],
  computed: {
    ...mapGetters({ settings: 'settings', store: 'store' }),
    storeUrl() {
      const storeUrl = 'http://' + (this.store && this.store.domain)
      return storeUrl
    },
  },
}
</script>

<style scoped>
.link {
  @apply text-primary-500 cursor-pointer  hover:text-primary-700 transition duration-300;
}
</style>
