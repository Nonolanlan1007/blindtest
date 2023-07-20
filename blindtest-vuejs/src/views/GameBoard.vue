<template>
  <main v-if="game && game.state === 'waiting_players'" class="waiting_room">
    <div class="creditals">
      <div class="left">
        <h1 v-if="isHost">
          Il est temps de rejoindre la partie !
        </h1>
        <h1 v-else>
          En attente du début de la partie...
        </h1>
        <h2>
          Code d'accès : <span class="code" :data-content="game.id" @click="copyLink" />
        </h2>
      </div>
      <div v-if="isHost" class="right">
        <QrCode :value="`${config.website}/?join=${game.id}`" />
        <h4>Scannez-moi pour gagner du temps !</h4>
      </div>
    </div>
    <div v-if="game && game.players.length > 0" class="players">
      <div v-for="player in game.players" :key="player.name" class="player" @click="isHost ? removePlayer(player) : null">
        <img v-if="player.avatar" class="avatar" :src="player.avatar" :alt="player.name">
        <h3 class="name">
          {{ player.name }}
        </h3>
        <TrashIcon class="trash" v-if="isHost" />
      </div>
    </div>
    <footer v-if="isHost">
      <p>
        Nombre de places restantes : <MinusIcon class="icon" @click="addSlot(-1)" /> {{ game.settings.maxPlayers - game.players.length }} <PlusIcon class="icon" @click="addSlot(1)" />
      </p>
      <button v-if="game.players.length > 0" @click="setState('waiting_songs')" class="button">
        Commencer la partie
      </button>
    </footer>
  </main>

  <main v-if="game && game.state === 'waiting_songs'" class="game_config">
    <div v-if="isHost" class="left" ref="left">
      <div v-for="player in game.players" class="player" :key="player.name" :style="{ '--progress-width': `${Math.round(game.songs.filter(x => x.addedBy === player.name).length * 100 / game.settings.songsLimitPerPlayer)}%` }">
        <img v-if="player.avatar" class="avatar" :src="player.avatar" :alt="player.name">
        <h3 class="name">
          {{ player.name }}
        </h3>
        <h2 class="songs_progress">
          {{ game.songs.filter(song => song.addedBy === player.name).length }}/{{ game.settings.songsLimitPerPlayer }}
        </h2>
      </div>
      <button v-if="game.players.filter(player => game.songs.filter(song => song.addedBy === player.name).length < game.settings.songsLimitPerPlayer).length === 0" class="button" @click="setState('playing')">
        Commencer la partie
      </button>
    </div>
    <div v-if="isHost" class="right">
      <h1 class="title">
        Paramètres de la partie
      </h1>
      <h2 class="subtitle">
        Il est temps de configurer la partie !
      </h2>
      <hr class="line">
      <div class="param">
        <h3 class="name">
          Mode de jeu
        </h3>
        <div class="selector">
          <div :class="`choice${game.settings.gameMode === 'classic' ? ' selected' : ''}`" @click="setGameMode('classic')">
            <h5>Classique</h5>
            <p>Prenez tout votre temps pour trouver la bonne réponse</p>
          </div>
          <div :class="`choice${game.settings.gameMode === 'firstnote' ? ' selected' : ''}`" @click="setGameMode('firstnote')">
            <h5>Première note</h5>
            <p>Vous n'avez que quelques secondes pour trouver la bonne réponse</p>
          </div>
        </div>
      </div>
      <hr class="line">
      <div class="param">
        <h3 class="name">
          Gagner des points sur ses propres musiques
        </h3>
        <h4 class="desc">
          Les joueurs pourront-ils gagner des points sur les musiques qu'ils auront eux-mêmes ajoutées ?
        </h4>
        <div class="selector">
          <div :class="`choice${game.settings.winPointsOnSelfAddedSongs ? ' selected' : ''}`" @click="setWinPointsOnSelfAdded(true)">
            <h5>✅ Oui</h5>
          </div>
          <div :class="`choice${!game.settings.winPointsOnSelfAddedSongs ? ' selected' : ''}`" @click="setWinPointsOnSelfAdded(false)">
            <h5>❌ Non</h5>
          </div>
        </div>
      </div>
      <hr class="line">
      <div class="param">
        <h3 class="name">
          Nombre maximal de chansons par joueur
        </h3>
        <h4>
          Les joueurs sont actuellement en train de choisir quelles musiques ils veulent retrouver dans le blindtest. Combien de musiques peuvent-ils choisir au maximum ?
        </h4>
        <input type="number" :value="game.settings.songsLimitPerPlayer" @input="setSongsLimit" />
      </div>
      <hr class="line">
      <div class="param">
        <h3 class="name">
          Gestion des points
        </h3>
        <h4>
          Combien de points gagne le joueur qui trouve :
        </h4>
        <div class="flex">
          <div class="container">
            <h4 class="desc">
              le titre ?
            </h4>
            <input type="number" :value="game.settings.pointsOnWin.title" @input="setWinPoints('title')" id="winPointsTitle">
          </div>
          <div class="container">
            <h4 class="desc">
              l'artiste ?
            </h4>
            <input type="number" :value="game.settings.pointsOnWin.artist" @input="setWinPoints('artist')" id="winPointsArtist">
          </div>
          <div class="container">
            <h4 class="desc">
              les deux ?
            </h4>
            <input type="number" :value="game.settings.pointsOnWin.bonus" @input="setWinPoints('bonus')" id="winPointsBonus">
          </div>
        </div>
        <h4 class="desc italic">
          ⚠️ Lorsqu'un joueur trouve les deux, les points sont additionnés (titre + artiste + les deux).
        </h4>
      </div>
      <hr class="line">
      <div class="param">
        <h3 class="name">
          Malus lors d'une mauvaise réponse
        </h3>
        <h3 class="desc">
          Combien de points perdent les joueurs lorsqu'ils se trompent ?
        </h3>
        <input type="number" :value="game.settings.penaltyOnWrongAnswer" @input="setWinPoints('penalty')" id="loosePoints">
      </div>
      <hr class="line" />
      <div class="param">
        <h3 class="name">
          Bannir le contenu explicite
        </h3>
        <h4 class="desc">
          Bannir le contenu portant le label <RouterLink class="link" to="https://fr.wikipedia.org/wiki/Parental_advisory" target="_blank"><img class="icon" src="@/assets/parental_advisory.png" alt="Parental Advisory" />Explicit Lyrics</RouterLink> ?
        </h4>
        <div class="selector">
          <div :class="`choice${game.settings.banExplicitSongs ? ' selected' : ''}`" @click="setExplicit(true)">
            <h5>✅ Oui</h5>
          </div>
          <div :class="`choice${!game.settings.banExplicitSongs ? ' selected' : ''}`" @click="setExplicit(false)">
            <h5>❌ Non</h5>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!isHost" class="song_choice">
      <h1 class="title">
        Blindtest
      </h1>
      <h2 class="subtitles">
        Il est temps d'ajouter les chansons que vous souhaitez voir dans ce quizz ! Attention, vous disposez d'une limite de {{ game.settings.songsLimitPerPlayer }} musique{{ game.songs.find(x => x.addedBy === username) ? ` et vous en avez déjà ajouté ${game.songs.filter(x => x.addedBy === username).length}` : "" }}.
      </h2>
      <h3 v-if="!game.settings.winPointsOnSelfAddedSongs" class="subtitles">
        ⚠️ RAPPEL : Le maître du jeu a décidé que vous ne pourrez pas gagner de points sur les chansons que vous ajoutez !
      </h3>
      <input type="text" placeholder="Ajouter une musique" v-model="songSearch" @input="() => searchResults = []">
      <div v-if="searchResults.length > 0 && game.songs.filter(x => x.addedBy === this.$store.username).length < game.settings.songsLimitPerPlayer" class="search_results">
        <p>Résultats de la recherche pour "{{ songSearch }}" :</p>
        <div v-for="result in searchResults.slice(0, 5)" class="result" :key="result.name" @click="addSong(result.name, result.artists.map(x => x.name).join(', '), result.album.images[0].url, result.explicit, result.id)" :id="result.id">
          <img v-if="result.album.images[0]" :src="result.album.images[0].url" :alt="result.name" class="album">
          <div class="infos">
            <h3 class="title">
              {{ result.name }}
            </h3>
            <h4 class="artist">
              {{ result.artists.map(x => x.name).join(", ") }}
            </h4>
          </div>
        </div>
      </div>
      <button v-if="game.songs.filter(x => x.addedBy === this.$store.username).length < game.settings.songsLimitPerPlayer" class="button" @click="findResults">
        Rechercher
      </button>
      <button v-else class="button" disabled>
        Vous avez atteint la limite de musiques
      </button>
    </div>
  </main>

  <!-- Songs -->
  <audio v-if="game && isHost && ['waiting_players', 'waiting_songs'].includes(game.state)" autoplay loop preload="auto" src="/waiting_song.mp3" id="waitingSong" />
  <audio preload="auto" src="/welcome.mp3" id="welcomeSound" />
  <YoutubeVue3 v-if="isHost === 'lol'" ref="player" videoid="aqqQRuO_UK0" width="0" height="0" autoplay="1" />
</template>

<script>
import config from "@/assets/config";
import QrCode from "qrcode.vue";
import Router from "@/router";
import MinusIcon from "@/components/svgs/MinusIcon.vue";
import PlusIcon from "@/components/svgs/PlusIcon.vue";
import TrashIcon from "@/components/svgs/TrashIcon.vue";
import { YoutubeVue3 } from "youtube-vue3";
import RouterLink from "@/components/router-link.vue";

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
      songSearch: "",
      searchResults: [],
      player: null
    }
  },
  components: { RouterLink, TrashIcon, PlusIcon, MinusIcon, QrCode, YoutubeVue3},
  methods: {
    copyLink () {
      navigator.clipboard.writeText(`${config.website}/?join=${this.game.id}`)

      const code = document.querySelector(".code")
      code.classList.add("copied")
      setTimeout(() => code.classList.remove("copied"), 1000)
    },
    addSlot (count) {
      if (this.game.settings.maxPlayers + count > 10) return;

      if (this.game.settings.maxPlayers + count < 0) return;

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
    setState (state) {
      if (!['waiting_players', 'waiting_songs', 'playing', 'end'].includes(state)) return;

      this.ws.send(JSON.stringify({
        method: "UPDATE",
        value: "STATE",
        data: {
          id: this.game.id,
          state: state
        }
      }))
    },
    findResults () {
      if (!this.songSearch) return;

      this.ws.send(JSON.stringify({
        method: "GET",
        value: "RESULTS",
        data: {
          id: this.game.id,
          query: this.songSearch
        }
      }))
    },
    addSong(title, artist, cover, explicit, id) {
      this.ws.send(JSON.stringify({
        method: "ADD",
        value: "SONG",
        data: {
          id: this.game.id,
          user: this.$store.username,
          title,
          artist,
          cover,
          explicit,
          songId: id
        }
      }))
    },
    setSongsLimit (event) {
      const element = event.target;

      if (element.value > 100) element.value = 100;
      if (element.value < 1 || !element.value) element.value = 1;

      this.ws.send(JSON.stringify({
        method: "UPDATE",
        value: "SETTING",
        data: {
          id: this.game.id,
          settings: {
            ...this.game.settings,
            songsLimitPerPlayer: Number(element.value)
          }
        }
      }))
    },
    setGameMode (mode) {
      this.ws.send(JSON.stringify({
        method: "UPDATE",
        value: "SETTING",
        data: {
          id: this.game.id,
          settings: {
            ...this.game.settings,
            gameMode: mode
          }
        }
      }))
    },
    setWinPointsOnSelfAdded (value) {
      if (value === false && this.game.players.length === 1) return alert("Cette ne peut être désactivée car il n'y a qu'un seul joueur dans la partie.");

      this.ws.send(JSON.stringify({
        method: "UPDATE",
        value: "SETTING",
        data: {
          id: this.game.id,
          settings: {
            ...this.game.settings,
            winPointsOnSelfAddedSongs: value
          }
        }
      }))
    },
    setWinPoints (value) {
      if (value === 'title') {
        const element = document.querySelector("#winPointsTitle")

        if (element.value > 100) element.value = 100;
        if (element.value < 0 || !element.value) element.value = 0;

        this.ws.send(JSON.stringify({
          method: "UPDATE",
          value: "SETTING",
          data: {
            id: this.game.id,
            settings: {
              ...this.game.settings,
              pointsOnWin: {
                ...this.game.settings.pointsOnWin,
                title: Number(element.value)
              }
            }
          }
        }))
      } else if (value === 'artist') {
        const element = document.querySelector("#winPointsArtist")

        if (element.value > 100) element.value = 100;
        if (element.value < 0 || !element.value) element.value = 0;

        this.ws.send(JSON.stringify({
          method: "UPDATE",
          value: "SETTING",
          data: {
            id: this.game.id,
            settings: {
              ...this.game.settings,
              pointsOnWin: {
                ...this.game.settings.pointsOnWin,
                artist: Number(element.value)
              }
            }
          }
        }))
      } else if (value === 'bonus') {
        const element = document.querySelector("#winPointsBonus")

        if (element.value > 100) element.value = 100;
        if (element.value < 0 || !element.value) element.value = 0;

        this.ws.send(JSON.stringify({
          method: "UPDATE",
          value: "SETTING",
          data: {
            id: this.game.id,
            settings: {
              ...this.game.settings,
              pointsOnWin: {
                ...this.game.settings.pointsOnWin,
                bonus: Number(element.value)
              }
            }
          }
        }))
      } else if (value === 'penalty') {
        const element = document.querySelector("#loosePoints")

        if (element.value > 100) element.value = 100;
        if (element.value < 0 || !element.value) element.value = 0;

        this.ws.send(JSON.stringify({
          method: "UPDATE",
          value: "SETTING",
          data: {
            id: this.game.id,
            settings: {
              ...this.game.settings,
              penaltyOnWrongAnswer: Number(element.value)
            }
          }
        }))
      }
    },
    setExplicit (value) {
      this.ws.send(JSON.stringify({
        method: "UPDATE",
        value: "SETTING",
        data: {
          id: this.game.id,
          settings: {
            ...this.game.settings,
            banExplicitSongs: value
          }
        }
      }))
    },
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

        if (this.game && this.game.players.length < res.data.players.length) {
          const audio = document.querySelector('#welcomeSound')
          const music = document.querySelector('#waitingSong')

          if (audio) {
            if (music) music.volume = 0.1
            audio.play()
            audio.addEventListener('ended', () => {
              if (music) music.volume = 1
            })
          }
        }

        this.game = res.data

        if (!this.isHost && this.$store.username && !this.game.players.find(player => player.name === this.$store.username)) this.router.go(`/?error=kicked&join=${id}`)

        if (res.songId) {
          const element = document.getElementById(res.songId)
          if (element) {
            element.classList.add("added")
            setTimeout(() => element.classList.remove("added"), 1000)
          }
        }
      } else if (res.type === "RESULTS") {
        this.searchResults = res.data
      } else if (res.type === "ERROR") {
        if (res.data.message === "Unknown game") this.router.go("/404")
        else if (res.data.message === "Name already taken") this.router.go(`/?error=name_already_taken&join=${id}`)
        else if (res.data.message === "Song already added") alert("Cette musique a déjà été ajoutée !")
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
    margin: 1em auto auto;
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
    margin: 1em auto auto;
    width: 75%;
    flex-wrap: wrap;
    height: 50vh;

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
      color: $primary-color;
      align-items: center;
      display: flex;
      transition: all .25s ease-in-out;
      margin: 0 1em 0 0;

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
  padding: 1em;

  .left {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 45%;
    margin-left: 1em;
    height: 90vh;

    .player {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 1em;
      background: $secondary-color;
      padding: 1em;
      border-radius: 1em;
      animation: PopOut .5s;
      width: 90%;
      position: relative;
      overflow: hidden;
      min-height: 1em;


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
        word-break: break-all;
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

    .button {
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

  .right {
    margin: 1em;
    width: 45%;
    background: $secondary-color;
    padding: 1em;
    border-radius: 1em;
    animation: PopOut .5s;
    text-align: left;
    overflow-y: scroll;
    overflow-x: hidden;
    height: 90vh;

    .title {
      font-size: 1.5em;
      color: $primary-color;
      margin-block: 0;
      margin-inline: 0;
      font-family: 'Bungee', sans-serif;
    }

    .subtitle {
      font-size: 1.25em;
      margin-block: 0;
      margin-inline: 0;
    }

    .line {
      width: 100%;
      height: 1px;
      background: $primary-color;
      margin: 1em 0;
      border-radius: 1em;
    }

    .param {
      margin: 1em 0;

      .name {
        font-size: 1.25em;
        color: $primary-color;
        margin-block: 0;
        margin-inline: 0;
        font-family: 'Bungee', sans-serif;
      }

      .desc {
        font-size: 1em;
        margin-block: 0;
        margin-inline: 0;
        display: flex;
        align-items: center;

        .link {
          color: $primary-color;
          text-decoration: underline;
          cursor: pointer;
          align-items: center;
          display: flex;
          transition: all .25s ease-in-out;

          &:hover {
            color: $tertiary-color;
          }

          .icon {
            height: 1em;
            margin: .5em;
          }
        }

        &.italic {
          font-style: italic;
        }
      }

      input {
        width: 90%;
        border: 2px solid $primary-color;
        border-radius: 1em;
        padding: .5em;
        font-size: 1em;
        background: $secondary-color;
        color: #000;
        margin: 1em 0;
        transition: all .5s ease-in-out;

        &:focus {
          outline: none;
          border: 2px solid $tertiary-color;
        }
      }

      .selector {
        display: flex;
        align-items: center;
        background: #313131;
        padding: .5em;
        border-radius: .5em;
        width: 90%;

        .choice {
          cursor: pointer;
          border-radius: .5em;
          margin: 0 .5em;
          padding: .5em;
          transition: all .25s ease-in-out;
          width: 100%;

          h5 {
            font-size: 1em;
            margin-block: 0;
            margin-inline: 0;
            color: $primary-color;
            font-family: 'Bungee', sans-serif;
          }

          p {
            font-size: .75em;
            margin-block: 0;
            margin-inline: 0;
            font-weight: bold;
          }

          &:not(.selected) {
            background: #494949;

            p {
              color: $secondary-color;
            }
          }

          &.selected {
            background: $secondary-color;
          }

          &:hover {
            scale: 1.05;
          }
        }
      }

      .flex {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 90%;

        .container {
          display: flex;
          flex-direction: column;
          width: 100%;
          margin: 0 .5em;
        }
      }
    }
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

    .button {
      background: $primary-color;
      color: white;
      border: none;
      border-radius: 1em;
      padding: .5em 1em;
      font-size: 1em;
      margin-top: 1em;
      cursor: pointer;
      transition: all .25s ease-in-out;
      animation: PopOut .5s;

      &:hover {
        scale: 1.1;
      }
    }

    .search_results {
      display: flex;
      flex-direction: column;
      margin: 0;
      overflow: hidden;
      padding: 1em;
      background: $secondary-color;
      border-bottom-left-radius: 1em;
      border-bottom-right-radius: 1em;
      transform-origin: top;
      animation: DropDown .5s;
      border-left: 2px solid $primary-color;
      border-right: 2px solid $primary-color;
      border-bottom: 2px solid $primary-color;

      .result {
        display: flex;
        align-items: center;
        width: 100%;
        padding: .5em;
        border-top: 2px solid $primary-color;
        transition: all .25s ease-in-out;
        overflow: hidden;
        cursor: pointer;

        &:hover {
          scale: .9;
        }

        .album {
          width: 7em;
          border-radius: .25em;
        }

        .infos {
          .title {
            font-size: 1.5em;
            text-align: left;
            margin-block: 0;
            margin-inline: 0;
            font-family: 'Bungee', sans-serif;
            margin-left: 1em;
          }

          .artist {
            font-size: 1.25em;
            text-align: left;
            margin-block: 0;
            margin-inline: 0;
            font-family: 'Bungee', sans-serif;
            margin-left: 1em;
          }
        }

        &.added {
          position: relative;

          &::before {
            content: "✅ Musique ajoutée";
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: green;
            color: white;
            padding: 10px;
            font-weight: bold;
            z-index: 200; /* Place le texte au-dessus de la div */
          }

          &::after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 255, 0, 0.5); /* Fond vert semi-transparent */
            z-index: 1;
          }
        }
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
      max-width: 90%;

      input[type="text"] {
        max-width: 90%;
      }

      .title {
        font-size: 2.5em;
      }

      .subtitles {
        font-size: 1.5em;
      }
    }
  }
}
</style>
