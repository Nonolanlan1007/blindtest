export default class Router {
  route ()  {
    return {
      path: window.location.pathname,
      host: window.location.host,
      origin: window.location.origin,
      routes: window.location.pathname.split("/").filter((r) => r !== ""),
      params: new URLSearchParams(window.location.search)
    }
  }

  reload () {
    window.location.reload()
    return true
  }

  go (path) {
    const currentRoute = this.route()
    if (currentRoute.path === path) return currentRoute

    if (path.startsWith("/")) window.location.href = `${currentRoute.origin}${path}`
    else window.open(path, "_blank")
    return this.route()
  }
}
