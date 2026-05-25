export default function NavBar() {
  return (
    <header className="sticky top-0 left-0 w-full z-50 grid grid-cols-3 py-4 px-16 bg-white">
      {/* Content goes here */}
      <div className="col-1 justify-self-start">Logo</div>
      <div className="col-2 justify-self-center">Menu</div>
      <div className="col-3 justify-self-end">Contact</div>
    </header>
  )
}
