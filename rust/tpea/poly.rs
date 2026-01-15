
// Copyright © 2026 Alerta Dino. All rights reserved.
// 
// This code was released under the BSD 3-Clause License.
// See the "LICENSE" file under project root.
// 
// @author (PUBLIC_ID) 1D-C2-9B-98-D6-C3-D6-AB
// @signphrase It was created on Earth by humans, although
//             I can't define what a "human" is.



use rand::Rng;
use std::collections::HashSet;

use crate::tpea::{gf::{gf_add, gf_div, gf_mul, gf_sub}, strategy::ChunkType};


/**
 * Evaluates a polynomial with the given coefficients at `x`.
 * Coefficients are ordered: `[constant, x^1, x^2, ..., x^k-1]`
 */
pub fn eval_poly(coeffs: &[u8], x: u8) -> u8 {
  let mut result: u8 = 0;

  for (power, &coeff) in coeffs.iter().enumerate() {
    let mut x_pow: u8 = 1;

    for _ in 0..power {
      x_pow = gf_mul(x_pow, x);
    }

    result = gf_add(result, gf_mul(coeff, x_pow));
  }

  return result;
}


// BASIC_SECRET_SPLITTING_LOGIC
#[derive(Debug, Clone)]
pub struct Share {
  pub id: u8,
  pub typ: ChunkType,
  pub data: Vec<u8>,
}

pub fn split_secret(secret: &[u8], threshold_k: u8, share_n: u8) -> Vec<Share> {
  assert!(threshold_k <= share_n);
  assert!(threshold_k > 1);

  let mut shares: Vec<Share> = (1..share_n)
    .map(|id| Share { id, data: Vec::with_capacity(secret.len()), typ: ChunkType::SignificantSliceDerived1 })
    .collect();

  let mut rng = rand::rng();

  for &sec_byte in secret {
    let mut coeffs: Vec<u8> = Vec::with_capacity(threshold_k as usize);
    coeffs.push(sec_byte);

    for _ in 1..threshold_k {
      coeffs.push(rng.random());
    }

    for share in &mut shares {
      let y = eval_poly(&coeffs, share.id);
      share.data.push(y);
    }
  }

  return shares;
}

pub fn recover_secret(shares: &[Share]) -> Vec<u8> {
  assert!(!shares.is_empty());

  let len = shares[0].data.len();
  let k = shares.len();

  let xs: Vec<u8> = shares.iter()
    .map(|s| s.id)
    .collect();

  let unique_ids: HashSet<u8> = xs.iter().cloned().collect();

  if unique_ids.len() != k {
    panic!("Found duplicated share ID");
  }

  let mut secret = Vec::with_capacity(len);

  for i in 0..len {
    let ys: Vec<u8> = shares.iter().map(|s| s.data[i]).collect();

    // Large Interpolation at x = 0
    // L(0) = Sum( y_j * basis_j(0) )
    // basis_j(0) = Product( (0 - x_m) / (x_j - x_m) ) for m != j

    let mut rec_byte = 0;

    for j in 0..k {
      let xj = xs[j];
      let yj = ys[j];

      let mut num = 1;
      let mut den = 1;

      for m in 0..k {
        if j == m { continue; }

        let xm = xs[m];

        // num = num * (0 - xm) -> which is just (-xm)
        // In GF( 2 ^ 8 ), subtraction in XOR, so -xm is just xm
        // However, logically it's (0 - xm)
        num = gf_mul(num, xm); // 0 - xm = xm in GF( 2 ^ 8 )

        // den = den * (xj - xm)
        den = gf_mul(den, gf_sub(xj, xm));
      }

      let basis = gf_div(num, den);
      let term = gf_mul(yj, basis);

      rec_byte = gf_add(rec_byte, term);
    }

    secret.push(rec_byte);
  }

  return secret;
}
// end BASIC_SECRET_SPLITTING_LOGIC
