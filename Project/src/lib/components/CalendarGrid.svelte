<script lang="ts">
    import './style.css';
    export let weekDates: Date[];
    export let timeSlots: string[];
    export let daysOfWeek: string[];
    export let eventsIndex: Record<string, any>;
    export let handleCellClick: (date: string, time: string) => void;
    export let formatDate: (date: Date) => string;
    export let isToday: (date: Date) => boolean;
    export let onEventMove: (from: {date: string, time: string}, to: {date: string, time: string}) => void;

    import TimeLine from './TIMELINE/timeLine.svelte';

    let currentHour = new Date().getHours();
    let draggedKey: string | null = null;
    let dragGhost: HTMLElement | null = null;

    function drag(node: HTMLElement) {
        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;

        const handleMousedown = (e: MouseEvent) => {
            if (!node.classList.contains('has-event')) return;

            isDragging = true;
            draggedKey = node.getAttribute('data-key');
            const rect = node.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            // ✅ Create ghost copy
            dragGhost = node.cloneNode(true) as HTMLElement;
            dragGhost.classList.add('drag-ghost');

            // ✅ Remove drag-source and any greyed-out styles from the ghost
            dragGhost.classList.remove('drag-source');
            const badge = dragGhost.querySelector('.event-badge') as HTMLElement;
            if (badge) {
                badge.style.opacity = '1';
                badge.style.filter = 'none';
            }

            dragGhost.style.position = 'fixed';
            dragGhost.style.left = `${rect.left}px`;
            dragGhost.style.top = `${rect.top}px`;
            dragGhost.style.width = `${rect.width}px`;
            dragGhost.style.height = `${rect.height}px`;
            dragGhost.style.pointerEvents = 'none';
            dragGhost.style.zIndex = '2000';
            dragGhost.style.opacity = '0.95';

            document.body.appendChild(dragGhost);
        };

        const handleMousemove = (e: MouseEvent) => {
            if (!isDragging || !dragGhost) return;
            dragGhost.style.left = `${e.clientX - offsetX}px`;
            dragGhost.style.top = `${e.clientY - offsetY}px`;
        };

        const handleMouseup = () => {
            if (isDragging) {
                dragGhost?.remove();
                dragGhost = null;
                isDragging = false;
            }
        };

        node.addEventListener('mousedown', handleMousedown);
        window.addEventListener('mousemove', handleMousemove);
        window.addEventListener('mouseup', handleMouseup);

        return {
            destroy() {
                node.removeEventListener('mousedown', handleMousedown);
                window.removeEventListener('mousemove', handleMousemove);
                window.removeEventListener('mouseup', handleMouseup);
            }
        };
    }

    function handleCellDragging(date: string, time: string) {
        const key = `${date}|${time}`;
        if (eventsIndex[key]) {
            draggedKey = key;
        }
    }

    function handleCellPlacement(date: string, time: string) {
        if (!draggedKey) return;
        const fromParts = draggedKey.split('|');
        const from = { date: fromParts[0], time: fromParts[1] };
        const to = { date, time };

        if (from.date === to.date && from.time === to.time) {
            draggedKey = null;
            return;
        }

        // Only allow placement if target slot is empty
        const targetKey = `${date}|${time}`;
        if (eventsIndex[targetKey]) {
            draggedKey = null;
            return;
        }

        // Notify parent to move event (and persist it)
        onEventMove(from, to);

        // Clear drag state
        draggedKey = null;
    }
</script>

<div class="calendar-grid">
    <div class="grid-header">
        <div class="time-column-header"></div>
        {#each weekDates as date, index}
            <div class="day-header" class:today={isToday(date)}>
                <div class="day-name">{daysOfWeek[index].toUpperCase()}</div>
                <div class="day-number" class:today-number={isToday(date)}>
                    {formatDate(date)}
                </div>
            </div>
        {/each}
    </div>

    <TimeLine {weekDates} />

    <div class="grid-body">
        {#each timeSlots as timeSlot, timeIndex}
            <div class="time-row">
                <div class="time-slot">{timeSlot}</div>
                {#each weekDates as date, dayIndex}
                    {@const dateStr = date.toISOString().split('T')[0]}
                    {@const key = `${dateStr}|${timeSlot}`}
                    <button
                            type="button"
                            class="calendar-cell"
                            class:current-hour={isToday(date) && currentHour === timeIndex}
                            class:has-event={!!eventsIndex[key]}
                            class:drag-source={key === draggedKey}
                            data-key={key}
                            on:click={() => handleCellClick(dateStr, timeSlot)}
                            on:mousedown={() => handleCellDragging(dateStr, timeSlot)}
                            on:mouseup={() => handleCellPlacement(dateStr, timeSlot)}
                            use:drag
                    >
                        {#if eventsIndex[key]}
                            <div class="event-badge">
                                {eventsIndex[key].title}
                            </div>
                        {/if}
                    </button>
                {/each}
            </div>
        {/each}
    </div>
</div>
