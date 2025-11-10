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

    // Helper for current hour
    let currentHour = new Date().getHours();
    let draggedKey: string | null = null;

    function drag(node: HTMLElement) {
        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;
        let originalPosition: { left: string; top: string; position: string; width: string } | null = null;
        let originalRect: DOMRect | null = null;

        const handleMousedown = (e: MouseEvent) => {
            if (!node.classList.contains('has-event')) return;
            isDragging = true;
            originalRect = node.getBoundingClientRect();
            node.style.zIndex = '1000';
            node.style.width = `${originalRect.width}px`;
            originalPosition = {
                left: node.style.left,
                top: node.style.top,
                position: node.style.position,
                width: node.style.width
            };
            offsetX = e.clientX - originalRect.left;
            offsetY = e.clientY - originalRect.top;
            node.style.cursor = 'grabbing';
        };

        const handleMousemove = (e: MouseEvent) => {
            if (!isDragging) return;
            node.style.position = 'absolute';
            node.style.pointerEvents = 'none';
            node.style.left = `${e.clientX - offsetX}px`;
            node.style.top = `${e.clientY - offsetY}px`;
        };

        const handleMouseup = () => {
            if (isDragging) {
                node.style.position = originalPosition?.position || '';
                node.style.left = originalPosition?.left || '';
                node.style.top = originalPosition?.top || '';
                node.style.pointerEvents = '';
                node.style.cursor = 'pointer';
                node.style.zIndex = '';
                node.style.width = originalPosition?.width || '';
            }
            isDragging = false;
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
        // Emit event to parent
        onEventMove(from, to);
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
                        on:click={() => handleCellClick(dateStr, timeSlot)}
                        on:mousedown={() => handleCellDragging(dateStr, timeSlot)}
                        on:mouseup={() => handleCellPlacement(dateStr, timeSlot)}
                        use:drag
                    >
                        {#if eventsIndex[key]}
                            <div class="event-badge">{eventsIndex[key].title}</div>
                        {/if}
                    </button>
                {/each}
            </div>
        {/each}
    </div>
</div>
