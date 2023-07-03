<template>
  <main v-if="game && game.state === 'waiting_players'" class="waiting_room">
    <div class="creditals">
      <div class="left">
        <h1 v-if="isHost">Il est temps de rejoindre la partie !</h1>
        <h1 v-else>En attente du début de la partie...</h1>
        <h2>Code d'accès : <span class="code" :data-content="game.id" @click="copyLink" /></h2>
      </div>
      <div v-if="isHost" class="right">
        <QrCode :value="`${config.website}/?join=${game.id}`" />
        <h4>Scannez-moi pour gagner du temps !</h4>
      </div>
    </div>
    <div v-if="game && game.players.length > 0" class="players">
      <div v-for="player in game.players" :key="player.name" class="player" @click="isHost ? removePlayer(player) : null">
         <img v-if="player.avatar" class="avatar" :src="player.avatar" :alt="player.name" />
        <h3 class="name">{{player.name}}</h3>
        <TrashIcon class="trash" v-if="isHost" />
      </div>
    </div>
    <footer v-if="isHost">
      <p>Nombre de places restantes : <MinusIcon class="icon" @click="addSlot(-1)" /> {{ game.settings.maxPlayers - game.players.length }} <PlusIcon class="icon" @click="addSlot(1)" /></p>
      <button v-if="game.players.length > 0" @click="startGame" class="button">Commencer la partie</button>
    </footer>
  </main>

  <main v-if="game && game.state === 'waiting_songs'" class="game_config">
    <div v-if="isHost" class="left" ref="left">
      <div v-for="player in game.players" class="player" :key="player.name" :style="{ '--progress-width': `${Math.round(game.songs.filter(x => x.addedBy === player.name).length * 100 / game.settings.songsLimitPerPlayer)}%` }">
        <img v-if="player.avatar" class="avatar" :src="player.avatar" :alt="player.name" />
        <h3 class="name">{{ player.name }}</h3>
        <h2 class="songs_progress">{{ game.songs.filter(song => song.addedBy === player.name).length }}/{{ game.settings.songsLimitPerPlayer }}</h2>
      </div>
    </div>
    <div v-if="isHost" class="right">

    </div>
    <div v-if="!isHost" class="song_choice">
      <h1 class="title">Blindtest</h1>
      <h2 class="subtitles">Il est temps d'ajouter les chansons que vous souhaitez voir dans ce quizz ! Attention, vous disposez d'une limite de {{ game.settings.songsLimitPerPlayer }} musique{{ game.songs.find(x => x.addedBy === username) ? ` et vous en avez déjà ajouté ${game.songs.filter(x => x.addedBy === username).length}` : "" }}.</h2>
      <h3 v-if="!game.settings.winPointsOnSelfAddedSongs" class="subtitles">⚠️ RAPPEL : Le maître du jeu a décidé que vous ne pourrez pas gagner de points sur les chansons que vous ajoutez !</h3>
      <input type="text" placeholder="Ajouter une musique" />
      <button class="button">Rechercher</button>
    </div>
  </main>

  <!-- Songs -->
  <audio v-if="game && isHost && ['waiting_players', 'waiting_songs'].includes(game.state)" autoplay loop preload="auto" src="/waiting_song.mp3" />
</template>

<script>
import config from "@/assets/config";
import QrCode from "qrcode.vue";
import Router from "@/router";
import MinusIcon from "@/components/svgs/MinusIcon.vue";
import PlusIcon from "@/components/svgs/PlusIcon.vue";
import TrashIcon from "@/components/svgs/TrashIcon.vue";

export default {
  name: 'GameBoard',
  computed: {
    config() {
      return config
    }
  },
  data() {
    return {
      game: null,
      ws: null,
      router: new Router(),
      isHost: false,
      username: this.$store.username
    }
  },
  components: {TrashIcon, PlusIcon, MinusIcon, QrCode},
  methods: {
    copyLink () {
      navigator.clipboard.writeText(`${config.website}/?join=${this.game.id}`)

      const code = document.querySelector(".code")
      code.classList.add("copied")
      setTimeout(() => code.classList.remove("copied"), 1000)
    },
    addSlot (count) {
      if (this.game.settings.maxPlayers + count > 25) return;

      this.ws.send(JSON.stringify({
        method: "UPDATE",
        value: "SETTING",
        data: {
          id: this.game.id,
          settings: {
            ...this.game.settings,
            maxPlayers: this.game.settings.maxPlayers + count,
          }
        }
      }))
    },
    removePlayer (player) {
      this.ws.send(JSON.stringify({
        method: "DELETE",
        value: "PLAYER",
        data: {
          id: this.game.id,
          name: player.name
        }
      }))
    },
    startGame () {
      this.ws.send(JSON.stringify({
        method: "UPDATE",
        value: "STATE",
        data: {
          id: this.game.id,
          state: "waiting_songs"
        }
      }))
    }
  },
  async mounted() {
    const id = this.router.route().routes.reverse()[0].toUpperCase()

    this.ws = new WebSocket(`${config.ws}/api/games/${id}`)

    this.ws.onopen = () => {
      if (this.$store.username !== "HOST") this.ws.send(JSON.stringify({
        method: "JOIN",
        data: {
          name: this.$store.username,
          id,
          avatar: "none"
        }
      }))
      else this.ws.send(JSON.stringify({
        method: "GET",
        value: "GAME",
        data: {
          id
        }
      }))
    }

    this.ws.onmessage = (event) => {
      const res = JSON.parse(event.data)

      if (!res || !res.type || !res.data) return;

      if (res.type === "GAME") {
        this.game = res.data

        if (!this.isHost && this.$store.username && !this.game.players.find(player => player.name === this.$store.username)) this.router.go(`/?error=kicked&join=${id}`)
      }
      if (res.type === "ERROR") {
        if (res.data.message === "Unknown game") this.router.go("/404")
        else if (res.data.message === "Name already taken") this.router.go(`/?error=name_already_taken&join=${id}`)
        else {
          console.error(res.data.message)
        }
      }
    }
  },
  async beforeMount () {
    const username = this.router.route().params.get('username')

    if (username) {
      this.$store.username = username
      this.isHost = false
    } else {
      this.$store.username = "HOST"
      this.isHost = true
    }
  }
};
</script>

<style lang="scss">
.waiting_room {
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
        cursor: pointer;

        &:hover::before {
          content: "COPIER";
        }

        &.copied::before {
          content: "COPIÉ!";
        }

        &::before {
          content: attr(data-content);
        }

        @media screen and (max-width: 768px) {
          margin-top: 0;
          margin-left: 0;
          position: relative;
          rotate: 0;
          font-size: 1em;
        }
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

  .players {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: auto;
    margin-top: 1em;
    width: 75%;
    flex-wrap: wrap;

    .player {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 1em;
      background: $secondary-color;
      padding: 1em;
      border-radius: 1em;
      flex-grow: 1;
      animation: PopOut .5s;

      .avatar {
        width: 100px;
        height: 100px;
        border-radius: 100%;
        overflow: hidden;
        margin-right: 1em;
      }

      .name {
        font-size: 1.5em;
        color: $primary-color;
        margin-block: 0;
        margin-inline: 0;
        font-family: 'Bungee', sans-serif;
      }

      .trash {
        height: 1.5em;
        fill: $primary-color;
        margin-left: 1em;
        scale: 0;
        transform-origin: center;
      }

      &:hover {
        cursor: pointer;

        .trash {
          scale: 1;
        }
      }
    }
  }

  footer {
    display: flex;
    align-items: center;
    position: fixed;
    bottom: 0;
    right: 0;
    left: 0;
    background: white;
    padding: .25em;
    justify-content: center;
    border-top: 2px solid $primary-color;

    p {
      font-size: 1em;
      margin: 0;
      color: $primary-color;
      align-items: center;
      display: flex;
      transition: all .25s ease-in-out;
      margin-right: 1em;

      .icon {
        fill: $primary-color;
        width: 1em;
        height: 1em;
        margin-inline: .5em;
        cursor: pointer;

        &:hover {
          scale: 1.2;
        }
      }
    }

    button {
      background: $primary-color;
      color: white;
      border: none;
      border-radius: 1em;
      padding: .5em 1em;
      font-size: 1em;
      margin: 0;
      margin-inline: 1em;
      cursor: pointer;
      transition: all .25s ease-in-out;
      animation: PopOut .5s;

      &:hover {
        scale: 1.1;
      }
    }
  }
}

.game_config {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .left {
    display: flex;
    justify-content: center;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: center;
    width: 45%;
    margin-left: 1em;

    .player {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 1em;
      background: $secondary-color;
      padding: 1em;
      border-radius: 1em;
      animation: PopOut .5s;
      width: 100%;
      position: relative;
      overflow: hidden;


      .avatar {
        width: 100px;
        height: 100px;
        border-radius: 100%;
        overflow: hidden;
        margin-right: 1em;
      }

      .name {
        font-size: 1.5em;
        color: $primary-color;
        margin-block: 0;
        margin-inline: 0;
        font-family: 'Bungee', sans-serif;
      }

      .songs_progress {
        font-size: 1.25em;
        color: $secondary-color;
        background: $primary-color;
        padding: .25em;
      }

      &::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        width: var(--progress-width);
        height: 15px;
        background-color: $primary-color;
        transition: all 1s ease;
      }
    }
  }

  .right {
    margin-right: 1em;
    width: 45%;
  }

  .song_choice {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    max-width: 50%;
    margin: auto;

    input[type="text"] {
      width: calc(100% - 1.5rem);
      margin-top: 1rem;
      padding: .5rem;
      border-radius: .2rem;
      border: 2px solid $primary-color;
      background: $secondary-color;
      font-size: 1.2rem;
      font-weight: 500;
      transition: all .1s ease-in-out;
      max-width: 25%;

      &:focus {
        outline: none;
        border-color: $tertiary-color;
      }
    }

    .title {
      font-size: 4em;
      text-align: center;
      color: $primary-color;
      margin-block: 0;
      margin-inline: 0;
      font-family: 'Bungee', sans-serif;
    }

    .subtitles {
      font-size: 2em;
      text-align: center;
      color: $secondary-color;
    }

    @media (max-width: 1000px) {
      max-width: 100%;
    }
  }
}
</style>
