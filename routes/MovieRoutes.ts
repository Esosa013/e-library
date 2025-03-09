export enum MovieRoutes {
  root = '/movie',
  addMovie = `${root}/add`,
  deleteMovie = `${root}/delete/:id`,
  updateMovie = `${root}/update/:id`,
  filterMovie = `${root}/filters`,
}
