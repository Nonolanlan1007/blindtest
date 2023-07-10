<template>
  <div
    class="router-link"
    @click="go"
  >
    <slot />
  </div>
</template>

<script>
import Router from "@/router";

export default {
  name: "RouterLink",
  props: {
    to: {
      type: String,
      required: true
    }
  },
  methods: {
    go() {
      const router = new Router()
      router.go(this.to)
    }
  },
};
</script>

<style lang="scss">
.router-link {
  cursor: pointer;
}
</style>
