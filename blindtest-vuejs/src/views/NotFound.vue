<template>
  <main class="main">
    <div class="content">
      <h1 class="title">Erreur 404</h1>
      <h2 class="subtitle">Partie introuvable !</h2>

      <div class="buttons">
        <RouterLink to="/" class="button primary">
          <HomeFlagIcon class="icon" />
          <div class="text">
            <h4>Revenir en terrain connu</h4>
            <p>D&apos;ailleurs, pourquoi ne pas en profiter pour créer votre propre partie ?</p>
          </div>
        </RouterLink>
      </div>
    </div>
  </main>
</template>

<script>
import HomeFlagIcon from "@/components/svgs/HomeFlagIcon.vue";
import RouterLink from "@/components/router-link.vue";

export default {
  name: 'HomeView',
  components: {HomeFlagIcon, RouterLink},
  methods: {},
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
        text-decoration: none;

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
          width: 90%;
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
      max-width: 100%;

      .buttons {
        flex-direction: column;

        .button {
          width: 90%;
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
