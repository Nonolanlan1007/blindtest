<template>
  <dialog class="popup" :id="name">
    <slot />
  </dialog>
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
  }
}
</script>

<style lang="scss">
$main: rgb(49,51,56);

.popup {
  border: none !important;
  border-radius: .5rem;
  text-align: center;
  padding: 1rem;
  width: 30rem;
  box-shadow: 0 0 1rem .5rem rgba(0,0,0,.2);

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
}
</style>
