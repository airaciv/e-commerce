import { LinkProps } from '@mui/material';
import { Link as MuiLink } from '@mui/material';
import NextLink from 'next/link';
import { UrlObject } from 'url';

export const Link = ({
  href,
  ...restProps
}: Omit<LinkProps, 'href'> & { href: string | UrlObject }) => {
  return (
    <NextLink href={href} passHref legacyBehavior>
      <MuiLink {...restProps} />
    </NextLink>
  );
};
