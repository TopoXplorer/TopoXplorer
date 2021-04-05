### ref: https://web.eecs.umich.edu/~dkoutra/tut/sdm14.html
"""
Graph Similarity Measure: Vertex/ Edge Overlap
Idea: Two graph are similar if they share many vertices and edges.

VEO = 2 * (#node_intersection + #edge_intersection) / (#node_graph1 + #node_graph2 + #edge_graph1 + #edge_graph2)

Node intersection: similarity with the corresponding nodes in the oppsite graph
Edge intersection: same edges existed between two pairs of corresponding nodes

"""
import numpy as np
from scipy.spatial.distance import cdist
from collections import Counter

def graph_sim(g1,g2,verbose=0):
    n1 = list(g1['nodes'].keys())
    n_nodes = np.max([np.max(g1['nodes'][n]) for n in n1]) + 1
    n1_vec = np.zeros((len(n1),n_nodes))
    for i,n in enumerate(n1):
        n1_vec[i,g1['nodes'][n]] = 1

    n2 = list(g2['nodes'].keys())
    n2_vec = np.zeros((len(n2),n_nodes))
    for i,n in enumerate(n2):
        n2_vec[i,g2['nodes'][n]] = 1
        
    dist = 1 - cdist(n1_vec,n2_vec,'jaccard')
    n1_correspondence = np.argmax(dist,1)
    n2_correspondence = np.argmax(dist,0)

    if verbose == 1:
        print(np.max(dist,1),np.max(dist,0))
    node_intersection = np.sum(np.max(dist,1)) + np.sum(np.max(dist,0))

    #edge similarity
    n1_hash = {n:i for i,n in enumerate(n1)}
    n2_hash = {n:i for i,n in enumerate(n2)}
    edges = {}
    edge_intersection = 0
    edges_total = 0

    for _n1 in g1['links']:
        for _n2 in g1['links'][_n1]:
            edges[(n1_hash[_n1],n1_hash[_n2])] = 1
            edges_total += 1

    for _n1 in g2['links']:
        for _n2 in g2['links'][_n1]:
            edges_total += 1
            _nc1 = n2_correspondence[n2_hash[_n1]]
            _nc2 = n2_correspondence[n2_hash[_n2]]
            _nc1, _nc2 = np.sort([_nc1, _nc2])
            if (_nc1,_nc2) in edges:
                edge_intersection += 1
                del edges[(_nc1,_nc2)]
                
    graph_similarity = (node_intersection + edge_intersection * 2) / (dist.shape[0] + dist.shape[1] + edges_total)
    return graph_similarity