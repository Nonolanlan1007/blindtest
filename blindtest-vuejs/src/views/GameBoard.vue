<template>
  <main v-if="game" class="waiting_room">
    <div class="creditals">
      <div class="left">
        <h1>Il est temps de rejoindre la partie !</h1>
        <h2>Code d'accès : <span class="code">{{ game.id }}</span></h2>
      </div>
      <div class="right">
        <QrCode :value="`${config.website}/game/${game.id}`" />
        <h4>Scannez-moi pour gagner du temps !</h4>
      </div>
    </div>
  </main>
</template>

<script>
import axios from "axios";
import config from "@/assets/config";
import QrCode from "qrcode.vue";

export default {
  name: 'HomeView',
  computed: {
    config() {
      return config
    }
  },
  data() {
    return {
      game: null
    }
  },
  components: {QrCode},
  methods: {},
  async beforeCreate() {
    const id = this.$route.params.id

    const game = await axios.get(`${config.api}/api/games/${id}`).then(res => res.data).catch(() => null)

    if (!game) return this.$router.push({ name: "NotFound" })

    this.game = game
  }
};
</script>

<style lang="scss">
.creditals {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;
  margin-top: 1em;
  width: fit-content;

  .left {
    display: flex;
    flex-direction: column;
    margin: 1em;
    background: $secondary-color;
    padding: 1em;
    border-radius: 1em;
    flex-grow: 1;

    h1 {
      font-size: 2em;
      color: $primary-color;
      margin-block: 0;
      margin-inline: 0;
      font-family: 'Bungee', sans-serif;
    }

    .code {
      font-size: 1.25em;
      color: $secondary-color;
      background: $primary-color;
      padding: .25em;
      rotate: 350deg;
      position: fixed;
      margin-left: .5em;
      margin-top: -.5em;
    }
  }

  .right {
    max-width: 100px;
    background: $secondary-color;
    padding: 1em;
    border-radius: 1em;
    flex-grow: 1;

    h4 {
      font-size: 1em;
      margin-block-start: 0;
      margin-inline: 0;
      color: $primary-color;
      font-style: italic;
      text-align: center;
    }
  }
}
</style>
