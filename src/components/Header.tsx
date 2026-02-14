import { NavLink } from "./NavLink";

const Header = () => {
  return (
    <header className="border-b border-border bg-card">
      <div className="container flex h-16 items-center justify-between">
        <span className="text-lg font-semibold text-foreground">MyApp</span>
        <nav className="flex items-center gap-6">
          <NavLink to="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground" activeClassName="text-foreground font-medium">Home</NavLink>
          <NavLink to="/about" className="text-sm text-muted-foreground transition-colors hover:text-foreground" activeClassName="text-foreground font-medium">About</NavLink>
          <NavLink to="/contact" className="text-sm text-muted-foreground transition-colors hover:text-foreground" activeClassName="text-foreground font-medium">Contact</NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Header;
