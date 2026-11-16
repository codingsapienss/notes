import DefaultNavbarItem from '@theme/NavbarItem/DefaultNavbarItem';
import ThemeSwitcher from '@theme/NavbarItem/ThemeSwitcher';
import FontZoomController from '@theme/NavbarItem/custom-fontZoom';

const ComponentTypes = {
  default: DefaultNavbarItem,
  'custom-themeSwitcher': ThemeSwitcher,
  'custom-fontZoom': FontZoomController,
};

export default ComponentTypes;
