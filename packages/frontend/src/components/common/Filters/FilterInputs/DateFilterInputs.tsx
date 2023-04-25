import {
    ConditionalRule,
    DateFilterRule,
    DimensionType,
    FilterOperator,
    formatDate,
    isDimension,
    isField,
    isFilterRule,
    isWeekDay,
    parseDate,
    TimeFrames,
    UnitOfTime,
} from '@lightdash/common';
import { Flex, Group, NumberInput } from '@mantine/core';
import { DatePickerInput, DateTimePicker } from '@mantine/dates';
import moment from 'moment';
import React from 'react';
import MonthAndYearInput from '../../MonthAndYearInput';
import WeekPicker, { convertWeekDayToDayPickerWeekDay } from '../../WeekPicker';
import YearInput from '../../YearInput';
import { useFiltersContext } from '../FiltersProvider';
import DefaultFilterInputs, { FilterInputsProps } from './DefaultFilterInputs';
import UnitOfTimeAutoComplete from './UnitOfTimeAutoComplete';

const DateFilterInputs = <T extends ConditionalRule = DateFilterRule>(
    props: React.PropsWithChildren<FilterInputsProps<T>>,
) => {
    const { field, rule, onChange, disabled } = props;
    const { startOfWeek } = useFiltersContext();
    const isTimestamp =
        isField(field) && field.type === DimensionType.TIMESTAMP;

    if (!isFilterRule(rule)) {
        throw new Error('DateFilterInputs expects a FilterRule');
    }

    switch (rule.operator) {
        case FilterOperator.EQUALS:
        case FilterOperator.NOT_EQUALS:
        case FilterOperator.GREATER_THAN:
        case FilterOperator.GREATER_THAN_OR_EQUAL:
        case FilterOperator.LESS_THAN:
        case FilterOperator.LESS_THAN_OR_EQUAL:
            if (isDimension(field) && field.timeInterval) {
                switch (field.timeInterval.toUpperCase()) {
                    case TimeFrames.WEEK:
                        return (
                            <Flex align="center" sx={{ flex: 1 }} gap="md">
                                <WeekPicker
                                    disabled={disabled}
                                    value={rule.values?.[0] || new Date()}
                                    // TODO: get rid of it
                                    // popoverProps={popoverProps}
                                    startOfWeek={startOfWeek}
                                    onChange={(value: Date) => {
                                        onChange({
                                            ...rule,
                                            values: [moment(value).toDate()],
                                        });
                                    }}
                                />
                            </Flex>
                        );
                    case TimeFrames.MONTH:
                        return (
                            <Group grow sx={{ flex: 1 }}>
                                <MonthAndYearInput
                                    disabled={disabled}
                                    value={rule.values?.[0] || new Date()}
                                    onChange={(value: Date) => {
                                        onChange({
                                            ...rule,
                                            values: [
                                                moment(value)
                                                    .startOf('month')
                                                    .toDate(),
                                            ],
                                        });
                                    }}
                                />
                            </Group>
                        );
                    case TimeFrames.YEAR:
                        return (
                            <YearInput
                                sx={{ flex: 1 }}
                                disabled={disabled}
                                value={rule.values?.[0] || new Date()}
                                onChange={(value: Date) => {
                                    onChange({
                                        ...rule,
                                        values: [
                                            moment(value)
                                                .startOf('year')
                                                .toDate(),
                                        ],
                                    });
                                }}
                            />
                        );
                    default:
                        break;
                }
            }

            if (isTimestamp) {
                return (
                    <DateTimePicker
                        sx={{ flex: 1 }}
                        withSeconds
                        placeholder="Enter date and time"
                        disabled={disabled}
                        value={
                            rule.values?.[0]
                                ? new Date(rule.values?.[0])
                                : new Date()
                        }
                        // TODO: come back to this
                        // defaultTimezone="UTC"
                        onChange={(value) => {
                            if (!value) return;
                            onChange({
                                ...rule,
                                values: [formatDate(value, undefined, true)],
                            });
                        }}
                        firstDayOfWeek={
                            isWeekDay(startOfWeek)
                                ? convertWeekDayToDayPickerWeekDay(startOfWeek)
                                : undefined
                        }
                    />
                );
            }

            return (
                <DatePickerInput
                    sx={{ flex: 1 }}
                    disabled={disabled}
                    firstDayOfWeek={
                        isWeekDay(startOfWeek)
                            ? convertWeekDayToDayPickerWeekDay(startOfWeek)
                            : undefined
                    }
                    value={
                        rule.values?.[0]
                            ? parseDate(rule.values?.[0], undefined)
                            : new Date()
                    }
                    onChange={(value) => {
                        if (!value) return;
                        onChange({
                            ...rule,
                            values: [formatDate(value, undefined, false)],
                        });
                    }}
                />
            );
        case FilterOperator.IN_THE_PAST:
        case FilterOperator.IN_THE_NEXT:
            const parsedValue = parseInt(rule.values?.[0], 10);
            return (
                <Group grow sx={{ flex: 1 }}>
                    <NumberInput
                        disabled={disabled}
                        min={0}
                        value={isNaN(parsedValue) ? undefined : parsedValue}
                        onChange={(value) =>
                            onChange({ ...rule, values: [value] })
                        }
                    />
                    <UnitOfTimeAutoComplete
                        disabled={disabled}
                        isTimestamp={isTimestamp}
                        value={rule.settings?.unitOfTime || UnitOfTime.days}
                        completed={rule.settings?.completed || false}
                        searchable
                        nothingFound="No results..."
                        // TODO: revisit this
                        // popoverProps={popoverProps}
                        onChange={(value) =>
                            onChange({
                                ...rule,
                                settings: {
                                    unitOfTime: value.unitOfTime,
                                    completed: value.completed,
                                },
                            })
                        }
                    />
                </Group>
            );
        case FilterOperator.IN_THE_CURRENT:
            return (
                <UnitOfTimeAutoComplete
                    sx={{ flex: 1 }}
                    disabled={disabled}
                    isTimestamp={isTimestamp}
                    value={rule.settings?.unitOfTime || UnitOfTime.days}
                    showOptionsInPlural={false}
                    showCompletedOptions={false}
                    completed={false}
                    searchable
                    nothingFound="No results..."
                    // TODO: revisit this
                    // popoverProps={popoverProps}
                    onChange={(value) =>
                        onChange({
                            ...rule,
                            settings: {
                                unitOfTime: value.unitOfTime,
                                completed: false,
                            },
                        })
                    }
                />
            );
        case FilterOperator.IN_BETWEEN:
            if (isTimestamp) {
                return (
                    <Group grow sx={{ flex: 1 }}>
                        <DateTimePicker
                            disabled={disabled}
                            placeholder="Enter start date and time"
                            withSeconds
                            value={
                                rule.values?.[0]
                                    ? new Date(rule.values?.[0])
                                    : new Date()
                            }
                            onChange={(value) => {
                                if (!value) return;
                                onChange({
                                    ...rule,
                                    values: [
                                        formatDate(value, undefined, true),
                                        rule.values?.[1],
                                    ],
                                });
                            }}
                            maxDate={
                                rule.values?.[1]
                                    ? new Date(rule.values?.[1])
                                    : undefined
                            }
                            firstDayOfWeek={
                                isWeekDay(startOfWeek)
                                    ? convertWeekDayToDayPickerWeekDay(
                                          startOfWeek,
                                      )
                                    : undefined
                            }
                        />

                        <DateTimePicker
                            disabled={disabled}
                            placeholder="Enter end date and time"
                            withSeconds
                            value={
                                rule.values?.[1]
                                    ? new Date(rule.values?.[1])
                                    : new Date()
                            }
                            onChange={(value) => {
                                if (!value) return;
                                onChange({
                                    ...rule,
                                    values: [
                                        rule.values?.[0],
                                        formatDate(value, undefined, true),
                                    ],
                                });
                            }}
                            minDate={
                                rule.values?.[0]
                                    ? new Date(rule.values?.[0])
                                    : undefined
                            }
                            firstDayOfWeek={
                                isWeekDay(startOfWeek)
                                    ? convertWeekDayToDayPickerWeekDay(
                                          startOfWeek,
                                      )
                                    : undefined
                            }
                        />
                    </Group>
                );
            }
            return (
                <DatePickerInput
                    sx={{ flex: 1 }}
                    type="range"
                    disabled={disabled}
                    placeholder="Pick dates range"
                    value={[
                        rule.values?.[0]
                            ? parseDate(
                                  formatDate(
                                      rule.values?.[0],
                                      undefined,
                                      false,
                                  ),
                                  TimeFrames.DAY,
                              )
                            : null,
                        rule.values?.[1]
                            ? parseDate(
                                  formatDate(
                                      rule.values?.[1],
                                      undefined,
                                      false,
                                  ),
                                  TimeFrames.DAY,
                              )
                            : null,
                    ]}
                    onChange={([date1, date2]) => {
                        if (!date1 && !date2) return;

                        onChange({
                            ...rule,
                            values: [
                                date1
                                    ? formatDate(date1, undefined, false)
                                    : null,
                                date2
                                    ? formatDate(date2, undefined, false)
                                    : null,
                            ],
                        });
                    }}
                    firstDayOfWeek={
                        isWeekDay(startOfWeek)
                            ? convertWeekDayToDayPickerWeekDay(startOfWeek)
                            : undefined
                    }
                />
            );
        default: {
            return <DefaultFilterInputs {...props} />;
        }
    }
};

export default DateFilterInputs;
