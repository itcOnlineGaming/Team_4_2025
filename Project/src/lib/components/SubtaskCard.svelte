
<script lang="ts">
    export let subtask: any;
    export let gridColumn: number;
    export let pixelsPerHour: number;
    export let isBeingDragged: boolean = false;
    export let onDragStart: (e: MouseEvent) => void;
    export let onClick: () => void;
    export let onResize: (newStartMinutes: number, newEndMinutes: number) => void;

    const SNAP_INTERVAL = 15;
    const MIN_HEIGHT_FOR_TEXT = 30;

    let isResizing = false;
    let resizeHandle: 'top' | 'bottom' | null = null;
    let initialStartMinutes = 0;
    let initialEndMinutes = 0;
    let initialY = 0;

    function timeToMinutes(timeStr: string): number {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    function snapToInterval(minutes: number): number {
        return Math.round(minutes / SNAP_INTERVAL) * SNAP_INTERVAL;
    }

    $: startMinutes = timeToMinutes(subtask.startTime);
    $: endMinutes = timeToMinutes(subtask.endTime);
    $: topPosition = (startMinutes / 60) * pixelsPerHour;
    $: height = ((endMinutes - startMinutes) / 60) * pixelsPerHour;
    $: showText = height >= MIN_HEIGHT_FOR_TEXT;

    function dragSubtask(node: HTMLElement) {
        let isDragging = false;
        let dragGhost: HTMLElement | null = null;
        let offsetX = 0;
        let offsetY = 0;

        const handleMousedown = (e: MouseEvent) => {
            if ((e.target as HTMLElement).closest('.status-badge') ||
                (e.target as HTMLElement).closest('.resize-handle')) {
                return;
            }

            e.preventDefault();
            isDragging = true;

            const rect = node.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            document.body.style.userSelect = 'none';
            document.body.style.webkitUserSelect = 'none';

            dragGhost = node.cloneNode(true) as HTMLElement;
            dragGhost.classList.add('drag-ghost');
            dragGhost.style.position = 'fixed';
            dragGhost.style.left = `${rect.left}px`;
            dragGhost.style.top = `${rect.top}px`;
            dragGhost.style.width = `${rect.width}px`;
            dragGhost.style.height = `${rect.height}px`;
            dragGhost.style.pointerEvents = 'none';
            dragGhost.style.zIndex = '2000';
            dragGhost.style.opacity = '0.8';

            document.body.appendChild(dragGhost);
            node.style.opacity = '0.3';

            onDragStart(e);
        };

        const handleMousemove = (e: MouseEvent) => {
            if (!isDragging || !dragGhost) return;
            e.preventDefault();
            dragGhost.style.left = `${e.clientX - offsetX}px`;
            dragGhost.style.top = `${e.clientY - offsetY}px`;
        };

        const handleMouseup = () => {
            if (isDragging) {
                dragGhost?.remove();
                dragGhost = null;
                node.style.opacity = '1';
                isDragging = false;

                document.body.style.userSelect = '';
                document.body.style.webkitUserSelect = '';
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
                document.body.style.userSelect = '';
                document.body.style.webkitUserSelect = '';
            }
        };
    }

    function handleResizeStart(e: MouseEvent, handle: 'top' | 'bottom') {
        e.stopPropagation();
        e.preventDefault();

        isResizing = true;
        resizeHandle = handle;
        initialY = e.clientY;
        initialStartMinutes = startMinutes;
        initialEndMinutes = endMinutes;

        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
        document.body.style.cursor = 'ns-resize';

        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;
            e.preventDefault();

            const deltaY = e.clientY - initialY;
            const deltaMinutes = (deltaY / pixelsPerHour) * 60;

            if (resizeHandle === 'bottom') {
                const newEndMinutes = snapToInterval(initialEndMinutes + deltaMinutes);
                if (newEndMinutes > initialStartMinutes && newEndMinutes <= 1440) {
                    onResize(initialStartMinutes, newEndMinutes);
                }
            } else if (resizeHandle === 'top') {
                const newStartMinutes = snapToInterval(initialStartMinutes + deltaMinutes);
                if (newStartMinutes >= 0 && newStartMinutes < initialEndMinutes) {
                    onResize(newStartMinutes, initialEndMinutes);
                }
            }
        };

        const handleMouseUp = () => {
            isResizing = false;
            resizeHandle = null;

            document.body.style.userSelect = '';
            document.body.style.webkitUserSelect = '';
            document.body.style.cursor = '';

            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }

    function handleCardClick() {
        onClick();
    }

    function handleStatusClick(e: Event) {
        e.stopPropagation();
    }
</script>

<div
        class="floating-subtask"
        class:being-dragged={isBeingDragged}
        class:resizing={isResizing}
        style="
        grid-column: {gridColumn};
        top: {topPosition}px;
        height: {height}px;
    "
        use:dragSubtask
>
    <div class="resize-handle resize-top" on:mousedown={(e) => handleResizeStart(e, 'top')}></div>
    <div class="subtask-card" class:minimal={!showText} on:click={handleCardClick} role="button" tabindex="0">
        {#if showText}
            <button class="status-badge {subtask.status || 'pending'}" on:click={handleStatusClick} type="button">
                {#if subtask.status === 'completed'}
                    ✓
                {:else if subtask.status === 'cancelled'}
                    ✕
                {:else}
                    ○
                {/if}
            </button>
            <div class="subtask-content">
                <span class="subtask-title">{subtask.title}</span>
            </div>
        {/if}
    </div>
    <div class="resize-handle resize-bottom" on:mousedown={(e) => handleResizeStart(e, 'bottom')}></div>
</div>

<style>
    .floating-subtask {
        pointer-events: auto;
        cursor: move;
        position: absolute;
        left: 8px;
        width: calc(100% - 16px);
        max-width: 140px;
        user-select: none;
        -webkit-user-select: none;
        box-sizing: border-box;
    }

    .floating-subtask.being-dragged {
        opacity: 0.3;
    }

    .floating-subtask.resizing {
        cursor: ns-resize;
    }

    .resize-handle {
        position: absolute;
        left: 4px;
        right: 4px;
        height: 10px;
        cursor: ns-resize;
        z-index: 10;
        opacity: 0;
        transition: opacity 0.2s;
        border-radius: 4px;
    }

    .floating-subtask:hover .resize-handle {
        opacity: 1;
    }

    .resize-top {
        top: 4px;
    }

    .resize-bottom {
        bottom: 4px;
    }

    .resize-handle:hover {
        background: rgba(59, 130, 246, 0.4);
    }

    .subtask-card {
        background: white;
        border: 2px solid #333;
        border-radius: 16px;
        padding: 10px;
        color: #333;
        font-size: 0.75rem;
        font-weight: 500;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s, box-shadow 0.2s;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        position: relative;
        user-select: none;
        -webkit-user-select: none;
        box-sizing: border-box;
        overflow: hidden;
        width: 100%;
    }

    .subtask-card.minimal {
        padding: 4px;
    }

    .status-badge {
        flex-shrink: 0;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: 2px solid #333;
        background: white;
        display: flex;
        align-items: center;
        justify-content: right;
        cursor: pointer;
        font-size: 12px;
        font-weight: bold;
        transition: all 0.2s;
        padding: 0;
    }

    .status-badge.completed {
        background: #22c55e;
        border-color: #22c55e;
        color: white;
    }

    .status-badge.cancelled {
        background: #ef4444;
        border-color: #ef4444;
        color: white;
    }

    .status-badge.pending {
        background: white;
        border-color: #333;
        color: #333;
    }

    .status-badge:hover {
        transform: scale(1.1);
    }

    .subtask-content {
        flex: 1;
        width: 100%;
        overflow: hidden;
        display: flex;
        align-items: flex-start;
        justify-content: left;
    }

    .subtask-title {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 6;
        -webkit-box-orient: vertical;
        line-height: 1.3;
        user-select: none;
        -webkit-user-select: none;
        font-size: 0.75rem;
        text-align: center;
        word-break: break-word;
        hyphens: auto;
    }

    .floating-subtask:hover .subtask-card {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    :global(.drag-ghost) {
        filter: drop-shadow(0 10px 15px rgba(0, 0, 0, 0.2));
        user-select: none !important;
        -webkit-user-select: none !important;
    }
</style>