
interface Route {
  path: string;
  host: string;
  origin: string;
  routes: string[];
  params: URLSearchParams;
}

export default class Router {
  public route (): Route  {
    return {
      path: window.location.pathname,
      host: window.location.host,
      origin: window.location.origin,
      routes: window.location.pathname.split("/").filter((route) => route !== ""),
      params: new URLSearchParams(window.location.search)
    }
  }

  public reload (): boolean {
    window.location.reload()
    return true
  }

  public go (path: string): Route {
    const currentRoute = this.route()
    if (currentRoute.path === path) return currentRoute

    if (path.startsWith("/")) window.location.href = `${currentRoute.origin}${path}`
    else window.location.href = `${path}`
    return this.route()
  }
}
