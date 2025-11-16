<script lang="ts">
    import './TimeLine.css';
    import MajorItem from './MajorItem.svelte';
</script>

<div class="timeline-container">
    <div class="timeline-header">
        <div class="timeline-label">Timeline</div>
        <MajorItem 
            title="Sample Task"
            color="red"
            startDay={2}
            endDay={4}
        />
        <MajorItem 
            title="Sample Task"
            color="blue"
            startDay={1}
            endDay={2}
        />
    </div>
</div>
