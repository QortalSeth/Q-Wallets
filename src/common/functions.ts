let timeSegments = [
	3.154e10,
	2.628e9,
	6.048e8,
	8.64e7,
	3.6e6,
	60000,
	-Infinity,
];

let makeTimeString = (unit: string, singularString: string) => (timeSegment: number, time: number) =>
	time >= 2 * timeSegment
		? `${Math.floor(time / timeSegment)} ${unit}s ago`
		: singularString;

let timeFunctions = [
	makeTimeString('year', '1 year ago'),
	makeTimeString('month', '1 month ago'),
	makeTimeString('week', '1 week ago'),
	makeTimeString('day', '1 day ago'),
	makeTimeString('hour', 'an hour ago'),
	makeTimeString('minute', 'a minute ago'),
	(_: any) => 'just now',
];

export function epochToAgo(epoch: number) {
	let timeDifference = Date.now() - epoch;
	let index = timeSegments.findIndex(time => timeDifference >= time);
	let timeAgo = timeFunctions[index](timeSegments[index], timeDifference);
	return timeAgo;
}

export function secondsToDhms(seconds: number) {
	seconds = Number(seconds);

	var d = Math.floor(seconds / (3600 * 24));
	var h = Math.floor(seconds % (3600 * 24) / 3600);
	var m = Math.floor(seconds % 3600 / 60);
	var s = Math.floor(seconds % 60);

	var dDisplay = d > 0 ? d + (d == 1 ? "d " : "d ") : "";
	var hDisplay = h > 0 ? h + (h == 1 ? "h " : "h ") : "";
	var mDisplay = m > 0 ? m + (m == 1 ? "m " : "m ") : "";
	var sDisplay = s > 0 ? s + (s == 1 ? "s" : "s") : "";

	return dDisplay + hDisplay + mDisplay + sDisplay;
}

export function timeoutDelay(delay: number) {
    return new Promise( res => setTimeout(res, delay) );
}

export function cropString(str: string) {
    return str.length > 24 ? str.substring(0, 8) + "..." + str.substring(str.length - 8) : str;
}

export function humanFileSize(bytes, si=false, dp=1) {
	const thresh = si ? 1000 : 1024;
  
	if (Math.abs(bytes) < thresh) {
	  return bytes + ' B';
	}
  
	const units = si 
	  ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
	  : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
	let u = -1;
	const r = 10**dp;
  
	do {
	  bytes /= thresh;
	  ++u;
	} while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
  
  
	return bytes.toFixed(dp) + ' ' + units[u];
  }