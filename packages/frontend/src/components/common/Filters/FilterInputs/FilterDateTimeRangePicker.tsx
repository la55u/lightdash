import { Flex, Text } from '@mantine/core';
import { DateTimePickerProps, DayOfWeek } from '@mantine/dates';
import dayjs from 'dayjs';
import { FC, useState } from 'react';
import FilterDateTimePicker from './FilterDateTimePicker';

interface Props
    extends Omit<
        DateTimePickerProps,
        'firstDayOfWeek' | 'getDayProps' | 'value' | 'onChange'
    > {
    value: [Date, Date] | null;
    onChange: (value: [Date, Date] | null) => void;
    firstDayOfWeek: DayOfWeek;
}

const FilterDateTimeRangePicker: FC<Props> = ({
    value,
    disabled,
    firstDayOfWeek,
    onChange,
    ...rest
}) => {
    const [date1, setDate1] = useState(value?.[0] ?? null);
    const [date2, setDate2] = useState(value?.[1] ?? null);

    return (
        <Flex align="center" w="100%" gap="xxs">
            <FilterDateTimePicker
                size="xs"
                withSeconds
                disabled={disabled}
                // FIXME: until mantine 7.4: https://github.com/mantinedev/mantine/issues/5401#issuecomment-1874906064
                // @ts-ignore
                placeholder="Start date"
                maxDate={
                    date2
                        ? dayjs(date2).subtract(1, 'second').toDate()
                        : undefined
                }
                firstDayOfWeek={firstDayOfWeek}
                {...rest}
                value={date1}
                onChange={(newDate) => {
                    if (!date2 || dayjs(newDate).isBefore(dayjs(date2))) {
                        setDate1(newDate);

                        if (newDate && date2) {
                            onChange([newDate, date2]);
                        }
                    }
                }}
            />

            <Text color="dimmed" sx={{ whiteSpace: 'nowrap' }} size="xs">
                –
            </Text>

            <FilterDateTimePicker
                size="xs"
                withSeconds
                disabled={disabled}
                // FIXME: until mantine 7.4: https://github.com/mantinedev/mantine/issues/5401#issuecomment-1874906064
                // @ts-ignore
                placeholder="End date"
                minDate={
                    date1 ? dayjs(date1).add(1, 'second').toDate() : undefined
                }
                firstDayOfWeek={firstDayOfWeek}
                {...rest}
                value={date2}
                onChange={(newDate) => {
                    if (!date1 || dayjs(newDate).isAfter(dayjs(date1))) {
                        setDate2(newDate);
                        if (newDate && date1) {
                            onChange([date1, newDate]);
                        }
                    }
                }}
            />
        </Flex>
    );
};

export default FilterDateTimeRangePicker;
