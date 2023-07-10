<template>
  <HomeView v-if="router.route().path === '/'" />
  <GameBoard v-else-if="router.route().path.startsWith('/game/')" />
  <NotFound v-else />
</template>

<script>
import HomeView from "@/views/HomeView.vue";
import GameBoard from "@/views/GameBoard.vue";
import NotFound from "@/views/NotFound.vue";
import Router from "@/router.js";

export default {
  name: "App",
  components: { HomeView, GameBoard, NotFound },
  data() {
    return {
      router: new Router(),
    };
  },
}
</script>

<style lang="scss">
@import "assets/_colors";

/* Fonts */
@import url('https://fonts.googleapis.com/css2?family=Titan+One&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Bungee&display=swap');

body {
  margin: 0;
  padding: 0 1em;
  background: linear-gradient(142deg, #ff6065, #ffb2f5, #ffec9d) no-repeat;
  background-size: 600% 600%;
  overflow: hidden;
}

/*html {
  height: 100%;
  width: 100%;
}*/

::-webkit-scrollbar {
  width: .5rem;
  border-radius: 10px;
  background-color: $tertiary-color;
}

::-webkit-scrollbar-thumb {
  background-color: $primary-color;
  border-radius: 10px;
}
</style>
