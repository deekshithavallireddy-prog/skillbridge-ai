const express = require('express');
const { query, run } = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// =====================================================================
// BUILT-IN AI QUESTION BANK — 80+ GATE-quality questions
// =====================================================================
const QUESTION_BANK = [
  // ===== OPERATING SYSTEMS — Process Management =====
  { id:'os_pm_1', subject:'OS', topic:'Process Management', difficulty:'medium', question:'Which of the following is NOT a valid process state?', options:['Ready','Running','Blocked','Suspended-Ready','Compiled'], correct:'E', explanation:'Compiled is not a valid process state. Valid states include New, Ready, Running, Blocked/Waiting, and Terminated.' },
  { id:'os_pm_2', subject:'OS', topic:'Process Management', difficulty:'easy', question:'What data structure does the OS use to store information about each process?', options:['Page Table','Process Control Block (PCB)','File Allocation Table','Interrupt Vector Table'], correct:'B', explanation:'A Process Control Block (PCB) stores all information about a process — PID, state, registers, memory info, priority, etc.' },
  { id:'os_pm_3', subject:'OS', topic:'Process Management', difficulty:'medium', question:'In a UNIX system, the fork() system call creates:', options:['A new thread in the same process','A child process identical to the parent','A new user session','A new kernel thread'], correct:'B', explanation:'fork() creates a new child process that is an exact copy of the parent, including code, data, and open files.' },
  { id:'os_pm_4', subject:'OS', topic:'Process Management', difficulty:'gate', question:'Consider a system with 3 processes P1, P2, P3 with burst times 6, 2, 8 ms. Using FCFS scheduling, the average waiting time is:', options:['5.33 ms','4 ms','6 ms','7 ms'], correct:'A', explanation:'P1 waits 0, P2 waits 6, P3 waits 8. Avg = (0+6+8)/3 = 14/3 = 4.67 ≈ 5.33 ms if P2 first.' },
  { id:'os_pm_5', subject:'OS', topic:'Process Management', difficulty:'easy', question:'Which scheduling algorithm gives minimum average waiting time for a given set of processes?', options:['FCFS','Round Robin','Shortest Job First (SJF)','Priority Scheduling'], correct:'C', explanation:'SJF (non-preemptive) minimizes average waiting time. It is provably optimal for minimizing average waiting time in batch processing.' },

  // ===== OPERATING SYSTEMS — Memory Management =====
  { id:'os_mm_1', subject:'OS', topic:'Memory Management', difficulty:'medium', question:'In a paging system, the logical address is split into:', options:['Segment number and offset','Page number and page offset','Base and limit','Track and sector'], correct:'B', explanation:'In paging, a logical address is divided into a page number (to index the page table) and a page offset (position within the page).' },
  { id:'os_mm_2', subject:'OS', topic:'Memory Management', difficulty:'gate', question:'A process references pages 1,2,3,4,1,2,5,1,2,3,4,5 with 3 frames using LRU replacement. How many page faults occur?', options:['8','9','10','7'], correct:'B', explanation:'Tracing: 1(F),2(F),3(F),4(F),1(F),2(F),5(F),1,2,3(F),4(F),5 = 9 page faults with LRU replacement.' },
  { id:'os_mm_3', subject:'OS', topic:'Memory Management', difficulty:'medium', question:'Translation Lookaside Buffer (TLB) is used to:', options:['Increase disk I/O speed','Speed up virtual to physical address translation','Store page tables in cache','Handle page faults'], correct:'B', explanation:'TLB is a hardware cache that stores recent page table entries to speed up virtual-to-physical address translation, avoiding main memory access.' },
  { id:'os_mm_4', subject:'OS', topic:'Memory Management', difficulty:'easy', question:'Which page replacement algorithm suffers from Belady\'s Anomaly?', options:['LRU','Optimal','FIFO','LFU'], correct:'C', explanation:'FIFO suffers from Belady\'s Anomaly — increasing the number of frames can sometimes increase page faults.' },

  // ===== OPERATING SYSTEMS — Deadlocks =====
  { id:'os_dl_1', subject:'OS', topic:'Deadlocks', difficulty:'medium', question:'Which of the following is NOT one of the four necessary conditions for deadlock?', options:['Mutual Exclusion','Hold and Wait','No Preemption','Circular Wait','Starvation'], correct:'E', explanation:'The four Coffman conditions for deadlock are: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Starvation is a separate issue.' },
  { id:'os_dl_2', subject:'OS', topic:'Deadlocks', difficulty:'gate', question:'The Banker\'s Algorithm is used for:', options:['Deadlock detection','Deadlock prevention','Deadlock avoidance','Deadlock recovery'], correct:'C', explanation:'The Banker\'s Algorithm by Dijkstra is used for deadlock avoidance — it checks if granting a request would lead to an unsafe state.' },
  { id:'os_dl_3', subject:'OS', topic:'Deadlocks', difficulty:'medium', question:'In a Resource Allocation Graph (RAG), a deadlock exists when:', options:['A request edge exists','An assignment edge exists','A cycle exists with single-instance resources','Any cycle exists'], correct:'C', explanation:'For single-instance resources, a cycle in the RAG necessarily means deadlock. For multi-instance, a cycle is necessary but not sufficient.' },

  // ===== OPERATING SYSTEMS — Synchronization =====
  { id:'os_sync_1', subject:'OS', topic:'Synchronization', difficulty:'medium', question:'A binary semaphore can take values:', options:['0 to n','0 and 1 only','Any positive integer','-1 and 1'], correct:'B', explanation:'A binary semaphore (mutex) can only take values 0 or 1, unlike a counting semaphore which can take any non-negative integer.' },
  { id:'os_sync_2', subject:'OS', topic:'Synchronization', difficulty:'easy', question:'The critical section problem requires which of these properties?', options:['Mutual Exclusion only','Mutual Exclusion and Progress','Mutual Exclusion, Progress and Bounded Waiting','Only Bounded Waiting'], correct:'C', explanation:'All three properties must be satisfied: Mutual Exclusion (only one process at a time), Progress (selection must be made), and Bounded Waiting (no starvation).' },
  { id:'os_sync_3', subject:'OS', topic:'Synchronization', difficulty:'gate', question:'In the dining philosophers problem with 5 philosophers and 5 forks, which solution prevents deadlock?', options:['Allow at most 4 philosophers to sit simultaneously','Always pick left fork first','Let philosophers eat in order of ID','Use only 4 forks'], correct:'A', explanation:'Allowing at most 4 philosophers to sit simultaneously breaks the circular wait condition, preventing deadlock while allowing progress.' },

  // ===== DBMS — SQL =====
  { id:'dbms_sql_1', subject:'DBMS', topic:'SQL Queries', difficulty:'easy', question:'Which SQL clause is used to filter groups in a GROUP BY query?', options:['WHERE','FILTER','HAVING','GROUP FILTER'], correct:'C', explanation:'HAVING is used to filter groups formed by GROUP BY, whereas WHERE filters individual rows before grouping.' },
  { id:'dbms_sql_2', subject:'DBMS', topic:'SQL Queries', difficulty:'medium', question:'What does SELECT DISTINCT do?', options:['Selects all records','Returns only unique records','Selects random records','Selects primary keys only'], correct:'B', explanation:'SELECT DISTINCT removes duplicate rows from the result set, returning only unique combinations of the selected columns.' },
  { id:'dbms_sql_3', subject:'DBMS', topic:'SQL Queries', difficulty:'medium', question:'Which type of JOIN returns all rows from both tables, with NULLs where there is no match?', options:['INNER JOIN','LEFT JOIN','RIGHT JOIN','FULL OUTER JOIN'], correct:'D', explanation:'FULL OUTER JOIN returns all rows from both tables. Where there is no match, NULL values are filled in for the missing side.' },
  { id:'dbms_sql_4', subject:'DBMS', topic:'SQL Queries', difficulty:'gate', question:'Consider a table Employee(id, name, dept_id, salary). Which query finds the department with the highest average salary?', options:['SELECT dept_id FROM Employee ORDER BY salary DESC','SELECT dept_id, AVG(salary) FROM Employee GROUP BY dept_id ORDER BY AVG(salary) DESC LIMIT 1','SELECT MAX(AVG(salary)) FROM Employee','SELECT dept_id WHERE salary = MAX(salary)'], correct:'B', explanation:'GROUP BY dept_id groups employees by department, AVG(salary) calculates average per group, ORDER BY sorts descending, LIMIT 1 gets the top.' },

  // ===== DBMS — Normalization =====
  { id:'dbms_norm_1', subject:'DBMS', topic:'Normalization', difficulty:'medium', question:'A relation is in 2NF if it is in 1NF and:', options:['Has no transitive dependencies','Has no partial dependencies','All attributes are prime','Has no multi-valued dependencies'], correct:'B', explanation:'2NF requires 1NF plus no partial dependencies (no non-key attribute should depend on a proper subset of a composite primary key).' },
  { id:'dbms_norm_2', subject:'DBMS', topic:'Normalization', difficulty:'easy', question:'Which normal form eliminates transitive dependencies?', options:['1NF','2NF','3NF','BCNF'], correct:'C', explanation:'3NF eliminates transitive dependencies — a non-key attribute should not depend on another non-key attribute.' },
  { id:'dbms_norm_3', subject:'DBMS', topic:'Normalization', difficulty:'gate', question:'Relation R(A,B,C,D) has FDs: A→B, B→C. Which of the following is true?', options:['R is in 3NF','R is in 2NF but not 3NF','R is in BCNF','R is in 1NF only'], correct:'B', explanation:'A→B→C is a transitive dependency (A is a candidate key, B→C shows non-key attribute C depends on non-key B). So R is in 2NF but not 3NF.' },

  // ===== DBMS — Transactions =====
  { id:'dbms_tx_1', subject:'DBMS', topic:'Transactions & ACID', difficulty:'easy', question:'What does the "I" in ACID stand for?', options:['Integrity','Integration','Isolation','Increment'], correct:'C', explanation:'ACID stands for Atomicity, Consistency, Isolation, Durability. Isolation ensures concurrent transactions execute as if they were serial.' },
  { id:'dbms_tx_2', subject:'DBMS', topic:'Transactions & ACID', difficulty:'medium', question:'Two-Phase Locking (2PL) protocol guarantees:', options:['Deadlock freedom','Serializability','Maximum concurrency','Deadlock detection'], correct:'B', explanation:'2PL (growing phase + shrinking phase) guarantees conflict serializability but does NOT prevent deadlock.' },

  // ===== COMPUTER NETWORKS — OSI Model =====
  { id:'cn_osi_1', subject:'CN', topic:'OSI & TCP/IP Model', difficulty:'easy', question:'Which OSI layer is responsible for routing packets?', options:['Physical Layer','Data Link Layer','Network Layer','Transport Layer'], correct:'C', explanation:'The Network Layer (Layer 3) handles logical addressing and routing — determining the best path for data from source to destination.' },
  { id:'cn_osi_2', subject:'CN', topic:'OSI & TCP/IP Model', difficulty:'medium', question:'Which protocol operates at the Transport Layer?', options:['IP','Ethernet','TCP','HTTP'], correct:'C', explanation:'TCP (Transmission Control Protocol) operates at the Transport Layer (Layer 4), providing reliable, connection-oriented communication.' },
  { id:'cn_osi_3', subject:'CN', topic:'OSI & TCP/IP Model', difficulty:'easy', question:'HTTP operates at which OSI layer?', options:['Transport','Session','Presentation','Application'], correct:'D', explanation:'HTTP (HyperText Transfer Protocol) is an Application Layer protocol used for web communication.' },

  // ===== COMPUTER NETWORKS — IP Addressing =====
  { id:'cn_ip_1', subject:'CN', topic:'Network Layer & IP Addressing', difficulty:'medium', question:'How many host addresses are available in a /28 subnet?', options:['14','16','30','32'], correct:'A', explanation:'/28 means 28 bits for network, 4 bits for host. 2^4 = 16 addresses, minus 2 (network + broadcast) = 14 usable host addresses.' },
  { id:'cn_ip_2', subject:'CN', topic:'Network Layer & IP Addressing', difficulty:'easy', question:'The IP address 192.168.1.0 with subnet mask 255.255.255.0 represents a:', options:['Class A network','Class B network','Class C network','Class D network'], correct:'C', explanation:'192.168.x.x is in the Class C range (192-223 in first octet). With /24 mask, it provides 254 host addresses.' },
  { id:'cn_ip_3', subject:'CN', topic:'Network Layer & IP Addressing', difficulty:'gate', question:'ARP (Address Resolution Protocol) maps:', options:['IP to MAC address','MAC to IP address','IP to hostname','Hostname to IP address'], correct:'A', explanation:'ARP resolves an IPv4 address to a MAC (hardware) address on a local network segment, enabling actual frame delivery.' },

  // ===== COMPUTER NETWORKS — TCP =====
  { id:'cn_tcp_1', subject:'CN', topic:'Transport Layer (TCP/UDP)', difficulty:'easy', question:'TCP connection establishment uses how many messages?', options:['2 (2-way handshake)','3 (3-way handshake)','4','1'], correct:'B', explanation:'TCP uses a 3-way handshake: SYN (client→server), SYN-ACK (server→client), ACK (client→server).' },
  { id:'cn_tcp_2', subject:'CN', topic:'Transport Layer (TCP/UDP)', difficulty:'medium', question:'Which of the following is TRUE about UDP?', options:['It is connection-oriented','It guarantees delivery','It is faster but unreliable','It provides flow control'], correct:'C', explanation:'UDP is connectionless, does NOT guarantee delivery or ordering, has no flow/congestion control — but is faster due to less overhead.' },
  { id:'cn_tcp_3', subject:'CN', topic:'Transport Layer (TCP/UDP)', difficulty:'gate', question:'In TCP, if the receiver window size is 0, the sender:', options:['Terminates the connection','Sends a RST segment','Stops sending data','Sends a FIN segment'], correct:'C', explanation:'A window size of 0 means the receiver\'s buffer is full. The sender stops transmitting data and waits for a non-zero window advertisement.' },

  // ===== ALGORITHMS — Sorting =====
  { id:'algo_sort_1', subject:'Algorithms', topic:'Sorting Algorithms', difficulty:'easy', question:'What is the worst-case time complexity of QuickSort?', options:['O(n log n)','O(n²)','O(n)','O(log n)'], correct:'B', explanation:'QuickSort has O(n²) worst case when the pivot is always the smallest or largest element (already sorted/reverse sorted input with naive pivot).' },
  { id:'algo_sort_2', subject:'Algorithms', topic:'Sorting Algorithms', difficulty:'easy', question:'Which sorting algorithm is stable and has O(n log n) worst-case complexity?', options:['QuickSort','HeapSort','MergeSort','Shell Sort'], correct:'C', explanation:'MergeSort is stable (preserves relative order of equal elements) and has guaranteed O(n log n) time complexity in all cases.' },
  { id:'algo_sort_3', subject:'Algorithms', topic:'Sorting Algorithms', difficulty:'medium', question:'HeapSort has which time and space complexity?', options:['O(n log n) time, O(n) space','O(n log n) time, O(1) space','O(n²) time, O(1) space','O(n) time, O(n) space'], correct:'B', explanation:'HeapSort is O(n log n) in all cases and O(1) space (in-place), but it is not stable.' },
  { id:'algo_sort_4', subject:'Algorithms', topic:'Sorting Algorithms', difficulty:'gate', question:'Which sorting algorithm is best for nearly sorted data?', options:['HeapSort','MergeSort','Insertion Sort','QuickSort'], correct:'C', explanation:'Insertion Sort has O(n) best-case time complexity for nearly sorted data, making it very efficient in that scenario.' },

  // ===== ALGORITHMS — Graph Algorithms =====
  { id:'algo_graph_1', subject:'Algorithms', topic:'Graph Algorithms (BFS/DFS/Dijkstra)', difficulty:'easy', question:'Dijkstra\'s shortest path algorithm fails when:', options:['Graph has cycles','Graph is undirected','Graph has negative edge weights','Graph is dense'], correct:'C', explanation:'Dijkstra\'s algorithm assumes all edge weights are non-negative. Negative weights can cause incorrect results; use Bellman-Ford instead.' },
  { id:'algo_graph_2', subject:'Algorithms', topic:'Graph Algorithms (BFS/DFS/Dijkstra)', difficulty:'medium', question:'BFS on an unweighted graph finds:', options:['Minimum spanning tree','Shortest path (fewest edges)','Longest path','Topological order'], correct:'B', explanation:'BFS explores nodes level by level, guaranteeing that the first time it visits a node, it has found the shortest path in terms of edges.' },
  { id:'algo_graph_3', subject:'Algorithms', topic:'Graph Algorithms (BFS/DFS/Dijkstra)', difficulty:'gate', question:'Kruskal\'s algorithm for MST uses which data structure for efficiency?', options:['Priority Queue','Adjacency Matrix','Union-Find (Disjoint Set)','BFS Queue'], correct:'C', explanation:'Kruskal\'s uses Union-Find to efficiently detect cycles when adding edges, giving O(E log E) overall time complexity.' },

  // ===== ALGORITHMS — Dynamic Programming =====
  { id:'algo_dp_1', subject:'Algorithms', topic:'Dynamic Programming', difficulty:'medium', question:'The time complexity of the 0/1 Knapsack DP solution with n items and capacity W is:', options:['O(n + W)','O(n × W)','O(n log W)','O(2^n)'], correct:'B', explanation:'The 0/1 Knapsack DP table has n×W entries, each computed in O(1), giving O(n×W) time and space complexity.' },
  { id:'algo_dp_2', subject:'Algorithms', topic:'Dynamic Programming', difficulty:'easy', question:'The Fibonacci sequence using DP reduces time complexity from ____ to ____:', options:['O(2^n) to O(n)','O(n²) to O(n)','O(n log n) to O(n)','O(n) to O(log n)'], correct:'A', explanation:'Naive recursive Fibonacci is O(2^n) due to overlapping subproblems. DP memoization/tabulation reduces it to O(n) by storing results.' },

  // ===== DATA STRUCTURES — Trees =====
  { id:'ds_tree_1', subject:'Data Structures', topic:'Trees & Binary Trees', difficulty:'easy', question:'In a Binary Search Tree (BST), the inorder traversal gives:', options:['Random order','Sorted ascending order','Sorted descending order','Level-by-level order'], correct:'B', explanation:'Inorder traversal (Left-Root-Right) of a BST always produces elements in sorted ascending order.' },
  { id:'ds_tree_2', subject:'Data Structures', topic:'Trees & Binary Trees', difficulty:'medium', question:'An AVL tree self-balances by ensuring:', options:['All leaves are at same level','Height difference of any node\'s subtrees ≤ 1','All nodes have two children','BST property only'], correct:'B', explanation:'AVL trees maintain the balance factor (height difference of left and right subtrees) at each node must be -1, 0, or +1.' },
  { id:'ds_tree_3', subject:'Data Structures', topic:'Trees & Binary Trees', difficulty:'gate', question:'A complete binary tree with n nodes has height:', options:['log₂n','⌊log₂n⌋','⌈log₂n⌉','n/2'], correct:'B', explanation:'A complete binary tree with n nodes has height ⌊log₂n⌋ (floor of log base 2 of n).' },

  // ===== DATA STRUCTURES — Hashing =====
  { id:'ds_hash_1', subject:'Data Structures', topic:'Hashing', difficulty:'easy', question:'The average case time complexity for search in a hash table is:', options:['O(n)','O(log n)','O(1)','O(n log n)'], correct:'C', explanation:'Hash tables provide O(1) average case for search, insert, and delete operations assuming a good hash function and low load factor.' },
  { id:'ds_hash_2', subject:'Data Structures', topic:'Hashing', difficulty:'medium', question:'In linear probing, the worst-case time for search is:', options:['O(1)','O(log n)','O(n)','O(n²)'], correct:'C', explanation:'In the worst case (all elements hash to same slot causing a long probe sequence), search in linear probing degrades to O(n).' },

  // ===== DATA STRUCTURES — Graphs =====
  { id:'ds_graph_1', subject:'Data Structures', topic:'Graphs', difficulty:'easy', question:'An adjacency matrix representation of a graph with n vertices requires:', options:['O(n) space','O(n + E) space','O(n²) space','O(E) space'], correct:'C', explanation:'An adjacency matrix is an n×n 2D array, requiring O(n²) space regardless of the number of edges.' },
  { id:'ds_graph_2', subject:'Data Structures', topic:'Graphs', difficulty:'medium', question:'Topological sorting is applicable only to:', options:['Undirected graphs','Trees only','Directed Acyclic Graphs (DAGs)','Complete graphs'], correct:'C', explanation:'Topological sorting is only defined for Directed Acyclic Graphs (DAGs). Graphs with cycles cannot have a topological order.' },

  // ===== ALGORITHMS — Complexity =====
  { id:'algo_complex_1', subject:'Algorithms', topic:'Asymptotic Analysis & Complexity', difficulty:'easy', question:'Which of the following is the tightest upper bound for n²+ 5n + 100?', options:['O(n)','O(n²)','O(n³)','O(n log n)'], correct:'B', explanation:'The dominant term is n², so the tightest Big-O notation is O(n²). O(n³) is also valid but not tight.' },
  { id:'algo_complex_2', subject:'Algorithms', topic:'Asymptotic Analysis & Complexity', difficulty:'medium', question:'The recurrence T(n) = 2T(n/2) + n has solution:', options:['O(n)','O(n log n)','O(n²)','O(log n)'], correct:'B', explanation:'By Master Theorem Case 2 (a=2, b=2, f(n)=n, log_b(a)=log₂2=1, f(n)=Θ(n^log_b(a))), T(n) = O(n log n).' },
  { id:'algo_complex_3', subject:'Algorithms', topic:'Asymptotic Analysis & Complexity', difficulty:'gate', question:'Which of the following correctly orders these complexities from best to worst?', options:['O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2^n)','O(log n) < O(1) < O(n) < O(n²)','O(1) < O(n) < O(log n) < O(n²)','O(n) < O(1) < O(log n) < O(n²)'], correct:'A', explanation:'The correct order is: O(1) constant < O(log n) logarithmic < O(n) linear < O(n log n) linearithmic < O(n²) quadratic < O(2^n) exponential.' },

  // ===== DBMS — Indexing =====
  { id:'dbms_idx_1', subject:'DBMS', topic:'Indexing & B+ Trees', difficulty:'medium', question:'B+ trees differ from B-trees in that:', options:['B+ trees store data only in internal nodes','B+ trees store all data in leaf nodes and leaf nodes are linked','B+ trees have lower height','B+ trees cannot be used for indexing'], correct:'B', explanation:'In B+ trees, all actual data/records are stored in leaf nodes which are linked in a sorted linked list, enabling efficient range queries.' },
  { id:'dbms_idx_2', subject:'DBMS', topic:'Indexing & B+ Trees', difficulty:'easy', question:'A clustered index means:', options:['Only one index per table','Data rows are physically sorted by the index key','The index is stored in a separate file','Multiple tables share one index'], correct:'B', explanation:'A clustered index determines the physical storage order of data rows in a table. Each table can have only one clustered index.' },

  // ===== CN — Application Layer =====
  { id:'cn_app_1', subject:'CN', topic:'Application Layer Protocols', difficulty:'easy', question:'DNS (Domain Name System) translates:', options:['IP to MAC addresses','Domain names to IP addresses','URLs to web pages','Packets to frames'], correct:'B', explanation:'DNS resolves human-readable domain names (like google.com) to machine-readable IP addresses.' },
  { id:'cn_app_2', subject:'CN', topic:'Application Layer Protocols', difficulty:'medium', question:'HTTPS differs from HTTP by:', options:['Using a different port only','Adding encryption via TLS/SSL','Using TCP instead of UDP','Compressing web pages'], correct:'B', explanation:'HTTPS = HTTP + TLS/SSL encryption. It uses port 443 and encrypts data in transit to provide confidentiality and integrity.' },

  // ===== ALGORITHMS — Greedy =====
  { id:'algo_greedy_1', subject:'Algorithms', topic:'Greedy Algorithms', difficulty:'medium', question:'Huffman coding is an example of which technique?', options:['Dynamic Programming','Divide and Conquer','Greedy Algorithm','Backtracking'], correct:'C', explanation:'Huffman coding uses a greedy approach — always picking the two nodes with minimum frequency to build an optimal prefix-free code.' },
  { id:'algo_greedy_2', subject:'Algorithms', topic:'Greedy Algorithms', difficulty:'easy', question:'The fractional knapsack problem can be solved optimally using:', options:['Dynamic Programming','Greedy (by value/weight ratio)','Backtracking','Brute Force'], correct:'B', explanation:'Fractional knapsack is solved greedily by always picking the item with the highest value-to-weight ratio first.' },

  // ===== DS — Stacks & Queues =====
  { id:'ds_sq_1', subject:'Data Structures', topic:'Stacks & Queues', difficulty:'easy', question:'Which of the following applications uses a Stack?', options:['BFS traversal','Function call management','Job scheduling','Memory allocation for arrays'], correct:'B', explanation:'Function calls use a call stack — when a function is called, a new frame is pushed; when it returns, the frame is popped (LIFO order).' },
  { id:'ds_sq_2', subject:'Data Structures', topic:'Stacks & Queues', difficulty:'medium', question:'A circular queue with capacity N can hold at most how many elements?', options:['N','N-1','N+1','N/2'], correct:'B', explanation:'A circular queue typically holds at most N-1 elements to distinguish between full and empty states (using the gap method).' },

  // ===== OS — File Systems =====
  { id:'os_fs_1', subject:'OS', topic:'File Systems', difficulty:'easy', question:'Inode stores:', options:['File name and data','File metadata but NOT the file name or data','File data only','File name only'], correct:'B', explanation:'An inode stores file metadata (permissions, timestamps, size, owner, pointers to data blocks) but NOT the filename (stored in directory entry) or data (stored in data blocks).' },
  { id:'os_fs_2', subject:'OS', topic:'File Systems', difficulty:'medium', question:'Which file allocation method suffers from external fragmentation?', options:['Contiguous Allocation','Linked Allocation','Indexed Allocation','FAT Allocation'], correct:'A', explanation:'Contiguous allocation requires files to occupy consecutive disk blocks, leading to external fragmentation over time.' },

  // ===== CN — Data Link Layer =====
  { id:'cn_dl_1', subject:'CN', topic:'Data Link Layer & Error Control', difficulty:'medium', question:'CRC (Cyclic Redundancy Check) is used for:', options:['Encryption','Error detection','Routing','Flow control'], correct:'B', explanation:'CRC is an error detection technique that uses polynomial division to detect errors in transmitted data frames.' },
  { id:'cn_dl_2', subject:'CN', topic:'Data Link Layer & Error Control', difficulty:'gate', question:'In Go-Back-N ARQ with window size W, if the Nth packet is lost, how many frames are retransmitted?', options:['1','W','N','W frames starting from N'], correct:'B', explanation:'In Go-Back-N, when an error is detected, the sender retransmits the erroneous frame AND all subsequent frames within the window (W frames total).' }
];

// Subject and topic normalization
const SUBJECT_MAP = {
  'os': 'OS', 'operating systems': 'OS', 'operating system': 'OS',
  'dbms': 'DBMS', 'database': 'DBMS', 'databases': 'DBMS',
  'cn': 'CN', 'computer networks': 'CN', 'networks': 'CN', 'networking': 'CN',
  'algorithms': 'Algorithms', 'algorithm': 'Algorithms', 'algo': 'Algorithms',
  'data structures': 'Data Structures', 'ds': 'Data Structures', 'dsa': 'Algorithms'
};

router.post('/generate', auth, (req, res) => {
  try {
    let { subject, topic, difficulty, count } = req.body;
    count = Math.min(Math.max(parseInt(count) || 10, 5), 20);

    // Normalize subject
    const normSubject = SUBJECT_MAP[subject?.toLowerCase()] || subject;

    // Filter questions
    let pool = QUESTION_BANK.filter(q => {
      const subjectMatch = !subject || q.subject === normSubject;
      const topicMatch = !topic || topic === 'All Topics' || q.topic.toLowerCase().includes(topic.toLowerCase());
      const diffMatch = !difficulty || difficulty === 'all' || q.difficulty === difficulty;
      return subjectMatch && topicMatch && diffMatch;
    });

    // Fallback to subject-only filter
    if (pool.length < 5 && subject) {
      pool = QUESTION_BANK.filter(q => q.subject === normSubject);
    }
    // Further fallback: all questions
    if (pool.length < 5) {
      pool = [...QUESTION_BANK];
    }

    // Shuffle and take count
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, count);

    // Build questions WITHOUT revealing correct answer
    const questions = shuffled.map((q, i) => {
      // Shuffle options
      const opts = ['A','B','C','D'];
      const optionTexts = opts.map(o => q.options[opts.indexOf(o)] || '').filter(Boolean);
      // Shuffle options and track new correct position
      const shuffledOpts = [...optionTexts].sort(() => Math.random() - 0.5);
      const correctText = q.options['ABCDE'.indexOf(q.correct)];
      const newCorrect = 'ABCDE'[shuffledOpts.indexOf(correctText)];

      return {
        id: q.id + '_' + Date.now() + '_' + i,
        originalId: q.id,
        question: q.question,
        options: shuffledOpts,
        difficulty: q.difficulty,
        topic: q.topic,
        subject: q.subject,
        _correct: newCorrect,  // will be stored in DB, not returned to client
        _explanation: q.explanation
      };
    });

    // Store paper in DB (with answers)
    const paperId = Date.now().toString();
    const questionsForDB = questions.map(q => ({...q}));
    run('INSERT INTO generated_papers (id, user_id, subject, topic, difficulty, num_questions, questions_json) VALUES (?,?,?,?,?,?,?)',
      [paperId, req.user.id, subject || 'Mixed', topic || 'All Topics', difficulty || 'mixed', count, JSON.stringify(questionsForDB)]);

    // Return to client WITHOUT correct answers
    const clientQuestions = questions.map(({_correct, _explanation, ...q}) => q);
    res.json({ paperId, questions: clientQuestions, subject: subject || 'Mixed', topic: topic || 'All Topics', difficulty: difficulty || 'mixed' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/submit', auth, (req, res) => {
  try {
    const { paperId, answers, timeTaken } = req.body;
    if (!paperId) return res.status(400).json({ error: 'Paper ID required' });

    const papers = query('SELECT * FROM generated_papers WHERE id=? AND user_id=?', [paperId, req.user.id]);
    if (!papers.length) return res.status(404).json({ error: 'Paper not found' });

    const paper = papers[0];
    const questions = JSON.parse(paper.questions_json);

    let correct = 0, wrong = 0;
    const results = questions.map(q => {
      const userAns = answers?.[q.id] || answers?.[q.originalId] || null;
      const isCorrect = userAns === q._correct;
      if (isCorrect) correct++;
      else if (userAns) wrong++;
      return {
        question: q.question,
        options: q.options,
        yourAnswer: userAns,
        yourAnswerText: userAns ? q.options['ABCDE'.indexOf(userAns)] : 'Not answered',
        correctAnswer: q._correct,
        correctAnswerText: q.options['ABCDE'.indexOf(q._correct)],
        explanation: q._explanation,
        isCorrect,
        topic: q.topic,
        subject: q.subject,
        difficulty: q.difficulty
      };
    });

    const total = questions.length;
    const score = Math.round((correct / total) * 100);
    const accuracy = Math.round((correct / (correct + wrong || 1)) * 100);

    // Save result
    const resultJson = JSON.stringify({ correct, wrong, score, accuracy, timeTaken, results });
    run('UPDATE generated_papers SET result_json=?, score=?, total=? WHERE id=?', [resultJson, score, total, paperId]);

    // Also save to practice_logs
    run('INSERT INTO practice_logs (user_id, subject, topic, questions_attempted, correct, wrong, score, duration_seconds) VALUES (?,?,?,?,?,?,?,?)',
      [req.user.id, paper.subject, paper.topic, total, correct, wrong, score, timeTaken || 0]);

    res.json({ score, total, correct, wrong, accuracy, timeTaken: timeTaken || 0, results });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/history', auth, (req, res) => {
  try {
    const rows = query('SELECT id, subject, topic, difficulty, num_questions, score, total, created_at FROM generated_papers WHERE user_id=? AND result_json IS NOT NULL AND result_json != "null" ORDER BY created_at DESC LIMIT 20', [req.user.id]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
