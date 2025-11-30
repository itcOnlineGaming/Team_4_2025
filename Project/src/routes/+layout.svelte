<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import SnackbarContainer from 'snackbar-project/demo-standalone/src/lib/snackbar/SnackbarContainer.svelte';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<SnackbarContainer />

{@render children?.()}

