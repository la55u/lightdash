import { Anchor, Button, ButtonProps } from '@mantine/core';
import React, { FC } from 'react';
import { useHistory } from 'react-router-dom';
import { EventData } from '../../providers/TrackingProvider/types';
import { useTracking } from '../../providers/TrackingProvider/useTracking';

export interface MantineLinkButtonProps extends ButtonProps {
    href: string;
    trackingEvent?: EventData;
    target?: React.HTMLAttributeAnchorTarget;
    forceRefresh?: boolean;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const MantineLinkButton: FC<MantineLinkButtonProps> = ({
    href,
    target,
    trackingEvent,
    forceRefresh = false,
    onClick,
    ...rest
}) => {
    const history = useHistory();
    const { track } = useTracking();

    return (
        <Anchor href={href} target={target} unstyled>
            <Button
                component="button"
                {...rest}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    if (
                        !forceRefresh &&
                        !e.ctrlKey &&
                        !e.metaKey &&
                        target !== '_blank'
                    ) {
                        e.preventDefault();
                        history.push(href);
                    }

                    onClick?.(e);

                    if (trackingEvent) track(trackingEvent);
                }}
            />
        </Anchor>
    );
};

export default MantineLinkButton;
