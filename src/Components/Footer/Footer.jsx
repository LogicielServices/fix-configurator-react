import "./Footer.css";

const Footer = () => {
  return (
    <footer className="app-footer">
      <small>&copy; {new Date().getFullYear()} Fix Configurator. All rights reserved.</small>
    </footer>
  );
};

export default Footer;
