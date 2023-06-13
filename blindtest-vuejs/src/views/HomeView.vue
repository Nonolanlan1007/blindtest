<template>
  <main class="main">
    <div class="content">
      <h1 class="title">Blindtest</h1>
      <h2 class="subtitle">LE jeu de devinettes musicales entre amis et en famille !</h2>

      <div class="buttons">
        <button class="button primary" @click="createGame">
          <ComputerIcon class="icon" />
          <div class="text">
            <h4>Créer une partie</h4>
            <p>Créez une partie et invitez vos amis à la rejoindre. Attention, un grand écran est recommandé !</p>
          </div>
        </button>
        <button class="button secondary" @click="openJoinGamePopUp">
          <PhoneIcon class="icon" />
          <div class="text">
            <h4>Rejoindre une partie</h4>
            <p>Vous avez un code ? Rejoignez la partie pour commencer à jouer !</p>
          </div>
        </button>
      </div>
    </div>
    <PopUp name="joinGame">
      <h1>Rejoindre une partie</h1>
      <p>Entrez le code de la partie à laquelle vous souhaitez participer.</p>
      <input type="text" placeholder="XXXXXX" />
      <p>Sous quel nom souhaitez-vous rejoindre la partie ?</p>
      <input type="text" placeholder="Michael Jackson" />
      <button class="button">Rejoindre</button>
    </PopUp>
  </main>
</template>

<script>
import axios from "axios";
import ComputerIcon from "@/components/svgs/ComputerIcon.vue";
import PhoneIcon from "@/components/svgs/PhoneIcon.vue";
import config from "@/assets/config";
import PopUp from "@/components/PopUp.vue";

export default {
  name: 'HomeView',
  components: {PopUp, PhoneIcon, ComputerIcon},
  methods: {
    async createGame() {
      const {data} = await axios.post(`${config.api}/api/games`)

      if (data) this.$router.push(`/game/${data.id}`)
    },
    openJoinGamePopUp () {
      const popup = document.getElementById("joinGame")
      if (popup) popup.showModal()
    }
  },
};
</script>

<style lang="scss">
.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .content {
    max-width: 30%;

    .title {
      font-size: 4em;
      text-align: center;
      color: $primary-color;
      margin-block: 0;
      margin-inline: 0;
      font-family: 'Bungee', sans-serif;
    }

    .subtitle {
      font-size: 2em;
      text-align: center;
      color: $secondary-color;
    }

    .buttons {
      margin-top: 2em;
      width: 100%;
      display: flex;
      justify-content: center;

      .button {
        padding: 1em;
        margin: 1em;
        border-radius: 1em;
        cursor: pointer;
        display: flex;
        align-items: center;
        text-align: start;
        width: 50%;
        outline: none;

        &.primary {
          background-color: $primary-color;
          border: $primary-color 5px solid;
          color: $secondary-color;
          transition: all 0.3s ease;

          .icon {
            fill: $secondary-color;
          }

          &:hover {
            background: none;
          }
        }

        &.secondary {
          background: $secondary-color;
          border: $secondary-color 5px solid;
          transition: all 0.3s ease;

          &:hover {
            background: none;
          }
        }

        .icon {
          width: 25%;
          height: 100%;
        }

        .text {
          width: 75%;
          margin-left: 0.5em;

          h4 {
            margin-block: 0;
            margin-inline: 0;
            font-size: 1.5em;
            font-family: 'Titan One', sans-serif;
            font-weight: normal;
          }

          p {
            margin-block-end: 0;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 1500px) {
  .main {
    .content {
      max-width: 100%;

      .buttons {
        flex-direction: column;

        .button {
          width: 100%;
          margin: 0;
          margin-top: 1em;

          h4 {
            font-size: 2em;
          }

          p {
            font-size: 1.5em;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 400px) {
  .main {
    .content {

      .title {
        font-size: 2.5em;
      }

      .subtitle {
        font-size: 1.5em;
      }
    }
  }
}
</style>
