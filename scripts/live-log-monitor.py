"""Read the optional private helper's local log without exposing raw records."""
import argparse
from collections import Counter
import json
from pathlib import Path
import time

ROOT = Path(__file__).resolve().parent.parent
DEFAULT = next((p for p in [ROOT / 'instagram-canli-log.jsonl', ROOT.parent / 'instagram-canli-log.jsonl'] if p.is_file()), ROOT / 'instagram-canli-log.jsonl')
EVENTS = {'request.start', 'request.end', 'request.error', 'operation.start', 'operation.end', 'operation.error', 'operation.busy', 'scan.page', 'scan.error', 'scan.pause', 'scan.resume', 'scan.cancel', 'unfollow.pause', 'unfollow.resume', 'unfollow.cancel', 'unfollow.result', 'panel.close', 'storage.error'}

def snapshot(file):
    try:
        stat = file.stat()
        with file.open('rb') as stream:
            stream.seek(max(0, stat.st_size - 262144))
            content = stream.read(262144).decode('utf-8', errors='replace')
    except FileNotFoundError:
        return {'available': False, 'recentActivity': False, 'events': {}, 'httpStatuses': {}, 'note': 'No local helper log. Browser-only store package does not stream to this file.'}
    events, statuses = Counter(), Counter()
    for line in content.splitlines()[-500:]:
        try:
            record = json.loads(line)
        except (ValueError, TypeError):
            continue
        if not isinstance(record, dict) or record.get('event') not in EVENTS:
            continue
        events[record['event']] += 1
        status = record.get('status')
        if type(status) is int and 100 <= status <= 599:
            statuses[str(status)] += 1
    return {'available': True, 'observedBytes': stat.st_size, 'recentActivity': time.time() - stat.st_mtime < 30, 'events': dict(events), 'httpStatuses': dict(statuses), 'scope': 'Last 500 bounded local log lines; no raw text, account names, tokens or headers. File freshness is not proof of an active connection.'}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--path', type=Path, default=DEFAULT)
    parser.add_argument('--seconds', type=int, default=0, choices=range(0, 61), metavar='0..60')
    args = parser.parse_args()
    until = time.monotonic() + args.seconds
    previous = None
    while True:
        result = json.dumps(snapshot(args.path), sort_keys=True)
        if result != previous:
            print(result, flush=True)
            previous = result
        if time.monotonic() >= until:
            break
        time.sleep(min(1, max(0, until - time.monotonic())))

if __name__ == '__main__':
    main()
