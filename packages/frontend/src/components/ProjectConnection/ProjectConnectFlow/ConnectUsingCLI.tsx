import {
    getDateFormat,
    OrganizationProject,
    TimeFrames,
} from '@lightdash/common';
import { Avatar, Button, LoadingOverlay, Stack, Text } from '@mantine/core';
import { Prism } from '@mantine/prism';
import { IconChevronLeft, IconClock } from '@tabler/icons-react';
import moment from 'moment';
import { FC, useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';
import useToaster from '../../../hooks/toaster/useToaster';
import { useCreateAccessToken } from '../../../hooks/useAccessToken';
import { useProjects } from '../../../hooks/useProjects';
import { useTracking } from '../../../providers/TrackingProvider';
import { EventName } from '../../../types/Events';
import MantineIcon from '../../common/MantineIcon';
import { ProjectCreationCard } from '../../common/Settings/SettingsCard';
import { OnboardingTitle } from './common/OnboardingTitle';
import OnboardingWrapper from './common/OnboardingWrapper';

interface ConnectUsingCliProps {
    siteUrl: string;
    version: string;
    onBack: () => void;
}

const ConnectUsingCLI: FC<React.PropsWithChildren<ConnectUsingCliProps>> = ({
    siteUrl,
    version,
    onBack,
}) => {
    const history = useHistory();
    const initialProjectFetch = useRef(false);
    const existingProjects = useRef<OrganizationProject[]>();
    const { showToastSuccess } = useToaster();
    const queryClient = useQueryClient();
    const { track } = useTracking();

    useProjects({
        refetchInterval: 3000,
        refetchIntervalInBackground: true,
        staleTime: 0,
        onSuccess: async (newProjects) => {
            if (!initialProjectFetch.current) {
                existingProjects.current = newProjects;
                initialProjectFetch.current = true;
            }

            if (
                existingProjects.current &&
                existingProjects.current.length < newProjects.length
            ) {
                const uuids = newProjects.map((p) => p.projectUuid);
                const existingUuids = existingProjects.current.map(
                    (p) => p.projectUuid,
                );

                const newProjectUuid = uuids.find(
                    (uuid) => !existingUuids.includes(uuid),
                );

                await queryClient.invalidateQueries('organization');

                history.replace(
                    `/createProject/cli?projectUuid=${newProjectUuid}`,
                );
            }
        },
    });

    const {
        mutate: mutateAccessToken,
        data: tokenData,
        isLoading: isTokenCreating,
        isSuccess: isTokenCreated,
    } = useCreateAccessToken();

    useEffect(() => {
        if (isTokenCreated) return;

        const expiresAt = moment().add(30, 'days').toDate();
        const generatedAtString = moment().format(
            getDateFormat(TimeFrames.SECOND),
        );

        mutateAccessToken({
            expiresAt,
            description: `Generated by the Lightdash UI for CLI at ${generatedAtString}`,
            autoGenerated: true,
        });
    }, [mutateAccessToken, isTokenCreated]);

    const handleCopy = useCallback(() => {
        showToastSuccess({ title: 'Commands copied to clipboard!' });
        track({ name: EventName.COPY_CREATE_PROJECT_CODE_BUTTON_CLICKED });
    }, [showToastSuccess, track]);

    return (
        <OnboardingWrapper>
            <Button
                pos="absolute"
                variant="subtle"
                size="sm"
                top={-50}
                leftIcon={<MantineIcon icon={IconChevronLeft} />}
                onClick={onBack}
            >
                Back
            </Button>

            <ProjectCreationCard>
                <LoadingOverlay
                    visible={!isTokenCreated || isTokenCreating}
                    overlayBlur={2}
                />

                <Stack spacing="xl">
                    <Stack align="center" spacing="sm">
                        <Avatar size="lg" radius="xl">
                            <MantineIcon
                                icon={IconClock}
                                size="xxl"
                                strokeWidth={1.5}
                                color="black"
                            />
                        </Avatar>

                        <Stack spacing="xxs">
                            <OnboardingTitle>Waiting for data</OnboardingTitle>

                            <Text>Inside your dbt project, run:</Text>
                        </Stack>
                    </Stack>

                    <Stack ta="left">
                        <Stack spacing="xs">
                            <Text fw={500}>1. Install lightdash CLI:</Text>

                            <Prism
                                language="bash"
                                onCopy={handleCopy}
                                styles={{ copy: { right: 0 } }}
                            >
                                {`npm install -g @lightdash/cli@${version}`}
                            </Prism>
                        </Stack>

                        <Stack spacing="xs">
                            <Text fw={500}>2. Login to lightdash:</Text>

                            <Prism
                                language="bash"
                                onCopy={handleCopy}
                                styles={{ copy: { right: 0 } }}
                            >
                                {`lightdash login ${siteUrl} --token ${tokenData?.token}`}
                            </Prism>
                        </Stack>

                        <Stack spacing="xs">
                            <Text fw={500}>3. Create project:</Text>

                            <Prism
                                language="bash"
                                onCopy={handleCopy}
                                styles={{ copy: { right: 0 } }}
                            >
                                lightdash deploy --create
                            </Prism>
                        </Stack>
                    </Stack>
                </Stack>
            </ProjectCreationCard>

            <Button
                component="a"
                variant="subtle"
                mx="auto"
                w="fit-content"
                target="_blank"
                rel="noreferrer noopener"
                href="https://docs.lightdash.com/get-started/setup-lightdash/get-project-lightdash-ready"
                onClick={() => {
                    track({
                        name: EventName.DOCUMENTATION_BUTTON_CLICKED,
                        properties: {
                            action: 'getting_started',
                        },
                    });
                }}
            >
                View docs
            </Button>
        </OnboardingWrapper>
    );
};

export default ConnectUsingCLI;
