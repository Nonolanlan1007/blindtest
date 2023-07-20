<template>
  <div class="back" :id="name">
    <div class="popup">
      <slot />
    </div>
  </div>
</template>

<script>

export default {
  name: "PopUp",
  props: {
    name: {
      type: String,
      required: true,
      default: "popup"
    }
  },
  methods: {
    close() {
      const popup = document.getElementById(this.name)
      if (popup) popup.style.display = "none"
      else console.error("PopUp not found")
    }
  },
  mounted() {
    const popup = document.getElementById(this.name)
    if (popup) popup.addEventListener("click", this.close)
    else console.error("PopUp not found")

    const content = document.querySelector(".popup")
    if (content) content.addEventListener("click", e => e.stopPropagation())
    else console.error("PopUp content not found")
  }
}
</script>

<style lang="scss">
$main: rgb(49,51,56);

.back {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  width: 100%;
  height: 100%;
  background-color: rgba($main, 0.5);
  display: none;

  .popup {
    border: none;
    border-radius: .5rem;
    text-align: center;
    padding: 1rem;
    box-shadow: 0 0 1rem .5rem rgba(0,0,0,.2);
    background: white;
    width: 25%;
    margin: auto;
    margin-top: 10%;
    animation: PopIn .2s ease-in-out;

    .icon {
      height: 4em;
    }

    h1 {
      font-size: 1.5rem;
      font-weight: 600;
    }

    p {
      font-size: 1.2rem;
      font-weight: 500;
    }

    input[type="text"] {
      width: calc(100% - 1.5rem);
      margin-top: 1rem;
      padding: .5rem;
      border-radius: .2rem;
      border: 2px solid $primary-color;
      background: transparent;
      font-size: 1.2rem;
      font-weight: 500;
      transition: all .1s ease-in-out;

      &:focus {
        outline: none;
        border-color: $tertiary-color;
      }
    }

    button {
      margin-top: 1rem;
      padding: .5rem 1rem;
      border-radius: .2rem;
      outline: none;
      border: none;
      background: $main;
      color: #fff;
      font-size: 1.2rem;
      font-weight: 600;
      transition: all .1s ease-in-out;
      cursor: pointer;
      width: 100%;
      height: 3rem;

      &:hover {
        background: $primary-color;
      }
    }

    select {
      width: 100%;
      border: 2px solid $primary-color;
      border-radius: .2rem;
      padding: .5rem;
      font-weight: 500;
      background: transparent;
      cursor: pointer;
      transition: all .1s ease-in-out;

      -webkit-appearance: none;
      -moz-appearance: none;

      &:focus {
        outline: none;
        border-color: $tertiary-color;
      }
    }


    &::backdrop {
      backdrop-filter: blur(1rem);
    }

    @media screen and (max-width: 1100px) {
      width: 50%;
    }

    @media screen and (max-width: 800px) {
      width: 75%;
    }

    @media screen and (max-width: 500px) {
      width: 90%;
    }
  }
}
</style>
