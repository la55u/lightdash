import {
    Anchor,
    AnchorProps,
    Breadcrumbs,
    BreadcrumbsProps,
    MantineSize,
    Tooltip,
    TooltipProps,
} from '@mantine/core';
import { FC, HTMLAttributes } from 'react';
import { Link } from 'react-router-dom';

type BreadCrumbItem = {
    title: React.ReactNode;
    to?: string;
    href?: string;
    onClick?: () => void;
    active?: boolean;
    tooltipProps?: Omit<TooltipProps, 'children'>;
};

export interface PageBreadcrumbsProps
    extends Omit<BreadcrumbsProps, 'children'> {
    size?: MantineSize;
    items: BreadCrumbItem[];
}

const PageBreadcrumbs: FC<React.PropsWithChildren<PageBreadcrumbsProps>> = ({
    items,
    size = 'lg',
    ...rest
}) => {
    return (
        <Breadcrumbs
            {...rest}
            styles={{
                root: {
                    display: 'block',
                    flexWrap: 'wrap',
                },
                separator: {
                    display: 'inline-block',
                },
            }}
        >
            {items.map((item, index) => {
                const commonProps: AnchorProps &
                    HTMLAttributes<HTMLAnchorElement> = {
                    size: size,
                    fw: item.active ? 600 : 500,
                    color: item.active ? 'gray.7' : 'gray.6',
                    onClick: item.onClick,
                    sx: {
                        whiteSpace: 'normal',
                        ...(item.onClick || item.to
                            ? {
                                  cursor: 'pointer',
                              }
                            : {
                                  cursor: 'text',
                                  '&:hover': {
                                      textDecoration: 'none',
                                  },
                              }),
                    },
                };

                const anchor = item.to ? (
                    <Anchor
                        key={item.tooltipProps ? undefined : index}
                        component={Link}
                        to={item.to}
                        {...commonProps}
                    >
                        {item.title}
                    </Anchor>
                ) : (
                    <Anchor
                        key={item.tooltipProps ? undefined : index}
                        {...commonProps}
                    >
                        {item.title}
                    </Anchor>
                );

                return item.tooltipProps ? (
                    <Tooltip key={index} {...item.tooltipProps}>
                        {anchor}
                    </Tooltip>
                ) : (
                    anchor
                );
            })}
        </Breadcrumbs>
    );
};

export default PageBreadcrumbs;
